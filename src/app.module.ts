import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MessagesModule, AuthModule, UserModule, PrismaModule],
})
export class AppModule {}
