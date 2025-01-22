import { BadRequestException, Injectable } from '@nestjs/common';
import { FriendshipStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

  public async findByName(username: string) {
    return await this.prisma.user.findUniqueOrThrow({
      where: {
        username,
      },
    });
  }

  public async friends(id: string) {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        friendSent: {
          where: {
            status: FriendshipStatus.ACCEPTED,
          },
          select: {
            id: true,
            to: {
              select: {
                username: true,
              },
            },
          },
        },
        friendReceived: {
          where: {
            status: FriendshipStatus.ACCEPTED,
          },
          select: {
            id: true,
            from: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
  }

  public async friendsRequests(id: string) {
    try {
      return this.prisma.friend.findMany({
        where: {
          toId: id,
          status: FriendshipStatus.PENDING,
        },
        select: {
          id: true,
          to: {
            select: {
              username: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Missing information');
        }
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  public async addFriend(id: string, friendId: string) {
    try {
      const canMakeRequest = await this.prisma.friend.findFirst({
        where: {
          OR: [
            {
              fromId: id,
              toId: friendId,
            },
            {
              toId: id,
              fromId: friendId,
            },
          ],
          status: {
            in: [FriendshipStatus.ACCEPTED, FriendshipStatus.PENDING],
          },
        },
      });

      console.log(canMakeRequest);

      if (canMakeRequest) {
        throw new BadRequestException(
          `Friendship already ${canMakeRequest.status}`,
        );
      }

      return this.prisma.friend.create({
        data: {
          fromId: id,
          toId: friendId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Missing information');
        }
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  public async acceptFriend(
    friendRequestId: string,
    userId: string,
    friendId: string,
  ) {
    return await this.prisma.friend.update({
      where: {
        id: friendRequestId,
        fromId: friendId,
        toId: userId,
      },
      data: {
        status: FriendshipStatus.ACCEPTED,
      },
    });
  }

  public async rejectFriend(
    friendRequestId: string,
    userId: string,
    friendId: string,
  ) {
    return await this.prisma.friend.update({
      where: {
        id: friendRequestId,
        fromId: friendId,
        toId: userId,
      },
      data: {
        status: FriendshipStatus.REJECTED,
      },
    });
  }

  public async remove(id: string) {
    try {
      const friendDelete = await this.prisma.friend.delete({
        where: {
          id,
        },
      });

      return friendDelete;
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code == 'P2025') {
          throw new BadRequestException('FriendShip not found');
        } else {
          throw new BadRequestException(error.message);
        }
      }
    }
  }
}
