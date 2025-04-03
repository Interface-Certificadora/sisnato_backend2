import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { SuporteService } from './suporte.service';
import { CreateSuporteDto } from './dto/create-suporte.dto';
import { UpdateSuporteDto } from './dto/update-suporte.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Suporte } from './entities/suporte.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';
import { ErrorSuporteEntity } from './entities/suporte.error.entity';

@Controller('suporte')
export class SuporteController {
  constructor(
    private readonly suporteService: SuporteService,
    private readonly S3: S3Service,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Salva a imagem e Cria o suporte',
    description: 'Endpoint para salvar a imagem e criar o suporte',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Suporte criado com sucesso',
    type: Suporte,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorSuporteEntity,
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  async create(
    @Body() createSuporteDto: CreateSuporteDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files.length > 0) {
      const urls = files.map((file) => {
        const Ext = file.originalname.split('.').pop();
        const NewName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${Ext}`;

        this.S3.uploadFile('suporte', NewName, file.mimetype, file.buffer);

        return {
          url_view: `${process.env.LOCAL_URL}/file/suporte/${NewName}`,
          url_download: `${process.env.LOCAL_URL}/file/download/suporte/${NewName}`,
        };
      });

      createSuporteDto.urlview = urls;
    }

    return await this.suporteService.create(createSuporteDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca todos os suportes',
    description: 'Endpoint para buscar todos os suportes',
  })
  @ApiResponse({
    status: 200,
    description: 'Suportes encontrados',
    type: [Suporte],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorSuporteEntity,
  })
  async findAll(@Param('id') id: string) {
    return await this.suporteService.findAll(+id);
  }

  @Get('/getone/:id')
  @ApiOperation({
    summary: 'Busca um suporte',
    description: 'Endpoint para buscar um suporte',
  })
  @ApiResponse({
    status: 200,
    description: 'Suporte encontrado',
    type: Suporte,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorSuporteEntity,
  })
  async findOne(@Param('id') id: string) {
    return await this.suporteService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um suporte deleta a imagem antiga e salva a nova',
    description:
      'Endpoint para atualizar um suporte deleta a imagem antiga e salva a nova',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Suporte atualizado com sucesso',
    type: Suporte,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorSuporteEntity,
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  async update(
    @Param('id') id: string,
    @Body() updateSuporteDto: UpdateSuporteDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (updateSuporteDto.filenames) {
      updateSuporteDto.filenames.forEach(async (filename) => {
        await this.S3.deleteFile('suporte', filename);
      });
    }
    if (files.length > 0) {
      const urls = files.map((file) => {
        const Ext = file.originalname.split('.').pop();
        const NewName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${Ext}`;

        this.S3.uploadFile('suporte', NewName, file.mimetype, file.buffer);
      });
      updateSuporteDto.urlview = urls;
    }
    return await this.suporteService.update(+id, updateSuporteDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deleta um suporte',
    description: 'Endpoint para deletar um suporte',
  })
  @ApiResponse({
    status: 200,
    description: 'Suporte deletado com sucesso',
    type: Suporte,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorSuporteEntity,
  })
  async remove(@Param('id') id: string) {
    return await this.suporteService.remove(+id);
  }
}
