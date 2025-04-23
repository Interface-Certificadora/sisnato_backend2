import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ChamadoService } from './chamado.service';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';
import { AuthGuard } from '../../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { Chamado } from './entities/chamado.entity';
import { ErrorChamadoEntity } from './entities/chamado.error.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';

@Controller('chamado')
export class ChamadoController {
  constructor(
    private readonly chamadoService: ChamadoService,
    private readonly S3: S3Service,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um novo chamado',
    description: 'Salva a imagem e cria um novo chamado',
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
        solicitacao: {
          type: 'number',
          example: 1,
          description: 'ID da solicitação',
        },
        descricao: {
          type: 'string',
          example: 'Descrição do chamado',
          description: 'Descrição do chamado',
        },
        status: {
          type: 'number',
          example: 0,
          description:
            'Status do chamado: 0 = iniciado, 1 = em andamento, 2 = enviado para NL2, 3 = concluído, 4 = cancelado',
        },
      },
      required: ['solicitacao', 'descricao', 'status'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Chamado criado com sucesso',
    type: Chamado,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar chamado',
    type: ErrorChamadoEntity,
  })
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() createChamadoDto: CreateChamadoDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files.length > 0) {
      const urls = files.map((file) => {
        const Ext = file.originalname.split('.').pop();
        const NewName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${Ext}`;

        this.S3.uploadFile('chamado', NewName, file.mimetype, file.buffer);

        return {
          url_view: `${process.env.LOCAL_URL}/file/chamado/${NewName}`,
          url_download: `${process.env.LOCAL_URL}/file/download/chamado/${NewName}`,
        };
      });

      createChamadoDto.images = urls;
    }
    return await this.chamadoService.create(createChamadoDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna todos os chamados',
    description: 'Retorna todos os chamados',
  })
  @ApiResponse({
    status: 200,
    description: 'Chamados retornados com sucesso',
    type: [Chamado],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao retornar chamados',
    type: ErrorChamadoEntity,
  })
  async findAll() {
    return await this.chamadoService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna um chamado',
    description: 'Retorna um chamado',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do chamado',
  })
  @ApiResponse({
    status: 200,
    description: 'Chamado retornado com sucesso',
    type: Chamado,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao retornar chamado',
    type: ErrorChamadoEntity,
  })
  async findOne(@Param('id') id: string) {
    return await this.chamadoService.findOne(+id);
  }

  @Patch('/atualizar/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um chamado',
    description: 'Atualiza um chamado com base no ID',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do chamado',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resposta: {
          type: 'string',
          example: 'Descrição do chamado',
          description: 'Descrição do chamado',
        },
        status: {
          type: 'number',
          example: 0,
          description:
            'Status do chamado: 0 = iniciado, 1 = em andamento, 2 = enviado para NL2, 3 = concluído, 4 = cancelado',
        },
      },
      required: ['solicitacao', 'descricao', 'status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chamado atualizado com sucesso',
    type: Chamado,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar chamado',
    type: ErrorChamadoEntity,
  })
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() updateChamadoDto: UpdateChamadoDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const urls = files.map((file) => {
        const Ext = file.originalname.split('.').pop();
        const NewName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${Ext}`;

        this.S3.uploadFile('chamado', NewName, file.mimetype, file.buffer);

        return {
          url_view: `${process.env.LOCAL_URL}/file/chamado/${NewName}`,
          url_download: `${process.env.LOCAL_URL}/file/download/chamado/${NewName}`,
        };
      });

      updateChamadoDto.imagens_adm = urls;
      return await this.chamadoService.update(+id, updateChamadoDto, req.user);
    } else {
      return await this.chamadoService.update(+id, updateChamadoDto, req.user);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Fecha um chamado',
    description: 'Fecha um chamado com base no ID',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do chamado',
  })
  @ApiResponse({
    status: 200,
    description: 'Chamado Fechado com sucesso',
    type: Chamado,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover chamado',
    type: ErrorChamadoEntity,
  })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.chamadoService.remove(+id, req.user);
  }

  @Get('/pesquisar')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna um chamado',
    description: 'Retorna um chamado',
  })
  @ApiQuery({})
  @ApiResponse({
    status: 200,
    description: 'Chamados retornados com sucesso',
    type: [Chamado],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao retornar chamados',
    type: ErrorChamadoEntity,
  })
  async pesquisar(@Query() query: any) {
    return await this.chamadoService.pesquisar(query);
  }

  @Get('/count/total')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna Quantidade de Chamados Abertos',
    description: 'Retorna Quantidade de Chamados Abertos',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantidade de Chamados Abertos retornados com sucesso',
    type: Number,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao retornar quantidade de Chamados Abertos',
    type: ErrorChamadoEntity,
  })
  async countTotal() {
    return await this.chamadoService.countTotal();
  }
}
