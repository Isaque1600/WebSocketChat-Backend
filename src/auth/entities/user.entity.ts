import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from 'src/dtos/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Password } from '../value-objects/password';

@Injectable()
export class User {
  public username: string;
  public password: Password;

  constructor(
    data: CreateUserDto,
    private prisma: PrismaService,
    private id?: string,
  ) {
    this.id = id ?? randomUUID();
    this.username = data.username;
    this.password = data.password;
  }

  static async create(data: CreateUserDto) {
    try {
      return await new User(data, new PrismaService()).save();
    } catch (error) {
      throw error;
    }
  }

  async save() {
    try {
      return await this.prisma.user.create({
        data: {
          id: this.id,
          username: this.username,
          password: await this.password.toString(),
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
