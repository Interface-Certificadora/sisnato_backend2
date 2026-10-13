import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChatConversaStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class ChatConversaFiltroDto {
  @ApiPropertyOptional({ enum: ChatConversaStatus })
  @IsOptional()
  @IsEnum(ChatConversaStatus)
  status?: ChatConversaStatus;

  @ApiPropertyOptional({ description: 'Só as conversas do atendente logado' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  minhas?: boolean;
}
