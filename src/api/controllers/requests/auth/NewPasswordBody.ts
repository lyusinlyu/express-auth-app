import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class NewPasswordBody {
  @IsString()
  @IsNotEmpty()
  public token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public password: string;
}
