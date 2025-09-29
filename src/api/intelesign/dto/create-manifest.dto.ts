import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateManifestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cpf: string;
}
