import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request } from 'express';
import { CreateUserDto } from 'src/dtos/user.dto';
import { User } from 'src/user/user.interface';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() data: CreateUserDto) {
    try {
      return await this.authService.register(data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new HttpException('User already exists', 400);
        }
        throw new HttpException(error.message, 500);
      }
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async login(@Body() data: CreateUserDto) {
    try {
      return await this.authService.login(data);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log('Error...:');
        console.log('Error Code: ' + error.code);
        console.log('Error Name: ' + error.message);
        if (error.code === 'P2025') {
          throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
      }
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() data: { refreshToken: string }) {
    return await this.authService.refresh(data.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request & { user: User }) {
    return await this.authService.me(req.user.username);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request & { user: User },
    @Body('refreshToken') refreshToken: string,
  ) {
    await this.authService.logout(req.user.accessToken, refreshToken);
  }
}
