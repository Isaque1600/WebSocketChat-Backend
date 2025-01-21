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

  async friends(id: string) {
    const friends = await this.userRepository.friends(id);

    const friendsSent = Array.from(friends.friendSent, (friend) => ({
      id: friend.id,
      username: friend.to.username,
    }));

    const friendsReceived = Array.from(friends.friendReceived, (friend) => ({
      id: friend.id,
      username: friend.from.username,
    }));

    return [...friendsSent, ...friendsReceived];
  }

  async requests(id: string) {
    return await this.userRepository.friendsRequests(id);
  }

  async addFriend(id: string, friendId: string) {
    return this.userRepository.addFriend(id, friendId);
  }

  async acceptFriendship(
    friendRequestId: string,
    userId: string,
    friendId: string,
  ) {
    return await this.userRepository.acceptFriend(
      friendRequestId,
      userId,
      friendId,
    );
  }
}
