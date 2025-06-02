import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";



export class ObjectImageDto {
    @ApiProperty(
      {
        example: 'https://example.com/file.pdf',
        description: 'URL para visualização do arquivo',
      }
    )
    @IsString()
     url_view: string;

     @ApiProperty(
      {
        example: 'https://example.com/file.pdf',
        description: 'URL para download do arquivo',
      }
    )
     @IsString()
     url_download: string;

     toJSON() {
        return {
            url_view: this.url_view,
            url_download: this.url_download,
        };
    }
}
