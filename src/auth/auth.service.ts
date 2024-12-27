import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: CreateUserDto) {
    try {
      return await User.create(data);
    } catch (error) {
      throw error;
    }
  }
}
