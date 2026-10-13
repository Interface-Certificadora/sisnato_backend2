import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ChatTextoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  texto: string;
}

/** Campos que acompanham o arquivo no multipart */
export class ChatMidiaDto {
  @ApiPropertyOptional({ description: 'Legenda' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  texto?: string;

  @ApiPropertyOptional({ description: 'Duração do áudio em segundos' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3600)
  duracaoSeg?: number;
}

export class ChatPaginacaoDto {
  @ApiPropertyOptional({ description: 'Traz mensagens com id menor que este' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  antesDe?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;
}

export class ChatLidasDto {
  @ApiProperty({ description: 'Marca como lidas todas até este id' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ateId: number;
}
