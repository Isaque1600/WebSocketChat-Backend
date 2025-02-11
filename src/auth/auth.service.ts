import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/dtos/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Password } from 'src/value-objects/password';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(data: CreateUserDto) {
    const user = await this.userService.create(data);

    delete user.password;

    return user;
  }

  async login(data: CreateUserDto) {
    const user = await this.userService.findByName(data.username);

    if (
      !(await Password.comparePassword(
        await data.password.toString(),
        user.password,
      ))
    ) {
      throw new UnauthorizedException();
    }

    return await this.generateTokens(user);
  }

  private async generateAccessToken(user: User) {
    return await this.jwt.signAsync(
      { username: user.username, sub: user.id },
      { expiresIn: '20m' },
    );
  }

  private async generateRefreshToken(user: User) {
    return await this.jwt.signAsync(
      { username: user.username, sub: user.id },
      { expiresIn: '15d' },
    );
  }

  private async generateTokens(user: User) {
    const tokens = await Promise.all([
      await this.generateAccessToken(user),
      await this.generateRefreshToken(user),
    ]);

    return { accessToken: tokens[0], refreshToken: tokens[1] };
  }

  private async verifyRefreshToken(refreshToken: string) {
    const payload = await this.jwt.decode(refreshToken);

    if (!payload) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userService.findByName(payload.username);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.jwt.verifyAsync(refreshToken);

      return user;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token', {
            cause: error,
            description: error.message,
          });
        }
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token expired', {
            cause: error,
            description: error.message,
          });
        }
      }
    }
  }

  public async verifyTokenNotBlackListed(
    accessToken: string,
    refreshToken?: string,
  ) {
    return await this.prisma.blackListTokens.findFirst({
      where: {
        tokens: {
          contains: `${accessToken},${refreshToken}`,
        },
      },
    });
  }

  async refresh(refreshToken: string) {
    const user = await this.verifyRefreshToken(refreshToken);
    return await this.generateTokens(user);
  }

  async me(username: string) {
    return await this.userService.findByName(username);
  }

  async logout(accessToken: string, refreshToken: string) {
    const refreshTokenDecoded = this.jwt.decode(refreshToken);

    if (!refreshTokenDecoded) {
      throw new BadRequestException('Missing refreshToken');
    }

    await this.prisma.blackListTokens.create({
      data: {
        tokens: `${accessToken},${refreshToken}`,
        expirationDate: new Date(refreshTokenDecoded.exp * 1000),
      },
    });
  }
}
