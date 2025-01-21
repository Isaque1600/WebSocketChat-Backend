import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class MessagesGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Socket = context.switchToWs().getClient();
    const accessToken: string = this.extractTokenFromHeader(req);
    const refreshToken = req.data.refreshToken ?? '';

    if (!accessToken) {
      throw new WsException('Unauthorized');
    }

    const verify = await Promise.all([
      await this.verifyAccessToken(accessToken),
      await this.verifyTokenNotBlackListed(accessToken, refreshToken),
    ]);

    const payload = verify[0];

    if (!payload || verify[1] !== null) {
      throw new WsException('Unauthorized');
    }

    req['user'] = { ...payload, accessToken: accessToken };

    return true;
  }

  private extractTokenFromHeader(request: Socket): string | undefined {
    const [type, token] =
      request.handshake.headers.authorization?.split(' ') ?? [];
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
            throw new WsException('Token expired');

          case 'JsonWebTokenError':
            throw new WsException({
              message: 'Invalid token',
              cause: error,
              description: error.message,
            });

          default:
            throw new WsException('Invalid Token');
        }
      }
    }
  }
}
