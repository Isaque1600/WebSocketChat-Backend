import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Password } from 'src/value-objects/password';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  public async create(data: CreateUserDto) {
    const password = await Password.hashValue(await data.password.toString());

    return await this.prisma.user.create({
      data: {
        username: data.username,
        password: password,
      },
    });
  }

  async findByName(username: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        username,
      },
    });
  }
}
