import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { IntelesignService } from './intelesign.service';
import { CreateIntelesignDto } from './dto/create-intelesign.dto';
import { UpdateIntelesignDto } from './dto/update-intelesign.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('intelesign')
export class IntelesignController {
  constructor(private readonly intelesignService: IntelesignService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        signatarios: {
          type: 'string',
          description: 'Array de IDs dos signatários',
          example:
            '[{"id": 1, "asstype": "simple || qualified", "type": "signer || approver || carbon-copy"}]',
        },
        valor: {
          type: 'number',
          description: 'Valor do documento',
          example: 100.0,
        },
        cca_id: {
          type: 'string',
          description: 'ID do CCA',
          example: '1',
        },
      },
      required: ['file'], // Defina os campos obrigatórios
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createIntelesignDto: CreateIntelesignDto, // Idealmente usar o DTO tipado
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.intelesignService.create(createIntelesignDto, file);
  }

  @Get()
  findAll() {
    return this.intelesignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.intelesignService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIntelesignDto: UpdateIntelesignDto,
  ) {
    return this.intelesignService.update(+id, updateIntelesignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.intelesignService.remove(+id);
  }
}
