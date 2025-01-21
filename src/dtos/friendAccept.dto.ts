import { IsNotEmpty } from 'class-validator';

export class AcceptFriendDTO {
  @IsNotEmpty()
  friendRequestId: string;
  @IsNotEmpty()
  friendId: string;
}
