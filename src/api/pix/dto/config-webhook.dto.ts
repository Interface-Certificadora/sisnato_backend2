import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para criação de um novo PIX
 * @param webhookUrl - URL do webhook
 */
export class ConfigWebhookDto {
  @ApiProperty({
    description: 'URL do webhook',
    example: 'https://example.com/webhook',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  webhookUrl: string;
}
