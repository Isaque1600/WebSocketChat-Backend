import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Password } from 'src/value-objects/password';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(16)
  password: Password;
}
