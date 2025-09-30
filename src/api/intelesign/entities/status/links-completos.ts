import { ApiProperty } from '@nestjs/swagger';

export class LinksCompletos {
  @ApiProperty({
    example: 'background_sheet',
    description: 'Background sheet do documento',
    type: String,
  })
  background_sheet: string;

  @ApiProperty({
    example: 'download',
    description: 'Download do documento',
    type: String,
  })
  download: string;

  @ApiProperty({
    example: 'display',
    description: 'Display do documento',
    type: String,
  })
  display: string;

  @ApiProperty({
    example: 'preview',
    description: 'Preview do documento',
    type: String,
  })
  preview: string;
}
