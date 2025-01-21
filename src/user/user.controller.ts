import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AcceptFriendDTO } from 'src/dtos/friendAccept.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('friends')
  @UseGuards(AuthGuard)
  async friends(@Req() req: Request & { user: { sub: string } }) {
    return await this.userService.friends(req.user.sub);
  }

  @Get('friends/requests')
  @UseGuards(AuthGuard)
  async requests(@Req() req: Request & { user: { sub: string } }) {
    return await this.userService.requests(req.user.sub);
  }

  @Post('friend/add')
  @UseGuards(AuthGuard)
  async add(
    @Req() req: Request & { user: { sub: string } },
    @Body('friendId')
    friendId: string,
  ) {
    if (!friendId) {
      throw new BadRequestException('Friend Id required');
    }

    if (req.user.sub == friendId) {
      throw new BadRequestException('Cannot add yourself');
    }

    return await this.userService.addFriend(req.user.sub, friendId);
  }

  @Post('friend/accept')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async accept(
    @Req() req: Request & { user: { sub: string } },
    @Body() data: AcceptFriendDTO,
  ) {
    return await this.userService.acceptFriendship(
      data.friendRequestId,
      req.user.sub,
      data.friendId,
    );
  }
}
