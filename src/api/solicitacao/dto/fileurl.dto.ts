import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FileUrlDto {
  @ApiPropertyOptional({
    description: 'URL para download do arquivo',
    type: String,
  })
  @IsOptional()
  url_download: string;

  @ApiPropertyOptional({
    description: 'URL para visualizar o arquivo',
    type: String,
  })
  @IsOptional()
  url_view: string;
}
