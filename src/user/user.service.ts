import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/dtos/user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findByName(username: string) {
    return await this.userRepository.findByName(username);
  }

  async create(data: CreateUserDto) {
    return await this.userRepository.create(data);
  }
}
