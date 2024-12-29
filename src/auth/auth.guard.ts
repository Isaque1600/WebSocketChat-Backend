import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(req);
    const refreshToken = req.body.refreshToken ?? '';

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    const verify = await Promise.all([
      await this.verifyAccessToken(accessToken),
      await this.verifyTokenNotBlackListed(accessToken, refreshToken),
    ]);

    const payload = verify[0];

    if (!payload || verify[1] !== null) {
      throw new UnauthorizedException();
    }

    req.user = { ...payload, accessToken: accessToken };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async verifyTokenNotBlackListed(
    accessToken: string,
    refreshToken?: string,
  ) {
    return await this.authService.verifyTokenNotBlackListed(
      accessToken,
      refreshToken,
    );
  }

  private async verifyAccessToken(accessToken: string) {
    try {
      return await this.jwt.verifyAsync(accessToken);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        switch (error.name) {
          case 'TokenExpiredError':
            throw new UnauthorizedException('Token expired', {
              cause: error,
              description: error.message,
            });

          case 'JsonWebTokenError':
            throw new UnauthorizedException('Invalid token', {
              cause: error,
              description: error.message,
            });

          default:
            throw new InternalServerErrorException('Invalid Token');
        }
      }
    }
  }
}
