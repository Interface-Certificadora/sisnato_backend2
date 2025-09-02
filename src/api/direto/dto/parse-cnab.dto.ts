import { IsNotEmpty, IsString } from 'class-validator';

export class ParseCnabDto {
  @IsString()
  @IsNotEmpty()
  hash: string;
}
