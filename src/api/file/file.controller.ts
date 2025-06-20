import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import mime from 'mime';
import { AuthGuard } from 'src/auth/auth.guard';
import { S3Service } from 'src/s3/s3.service';
import { Readable } from 'stream';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly S3: S3Service,
    private readonly Service: FileService,
  ) {}
  private Setores = ['cnh', 'doc', 'chamado', 'suporte', 'sisnatodoc'];

  @Post(':setor')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload de Arquivos',
    description:
      'Endpoint para upload de arquivos. O setor deve ser um dos seguintes: cnh, doc, chamado, suporte',
  })
  @ApiParam({
    name: 'setor',
    required: true,
    description: 'Nome do setor (ex: cnh, doc, chamado, suporte)',
    example: 'doc',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    content: {
      'application/json': {
        example: {
          url_view: 'https://example.com/file.pdf',
          url_download: 'https://example.com/file.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    content: {
      'application/json': {
        example: {
          error: 'Resposta de Error',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Param('setor') setor: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!this.Setores.includes(setor)) {
      throw new HttpException({ error: 'Setor não encontrado' }, 404);
    }
    const Ext = file.originalname.split('.').pop();
    const NewName = `${Date.now()}.${Ext}`;
    await this.S3.uploadFile(setor, NewName, file.mimetype, file.buffer);
    const data = {
      url_view: `${process.env.LOCAL_URL}/file/${setor}/${NewName}`,
      url_download: `${process.env.LOCAL_URL}/file/download/${setor}/${NewName}`,
    };
    return data;
  }
  

  @Get(':setor')
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todos os arquivos de um setor',
    description: 'Endpoint para listar todos os arquivos de um setor.',
  })
  @ApiParam({
    name: 'setor',
    required: true,
    description: 'Nome do setor (ex: cnh, doc, chamado, suporte)',
    example: 'doc',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivos listados com sucesso',
    content: {
      'application/json': {
        example: {
          message: 'Arquivos listados com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Setor não encontrado',
    content: {
      'application/json': {
        example: {
          error: 'Setor não encontrado',
        },
      },
    },
  })
  async findAll(@Param('setor') setor: string) {
    if (!this.Setores.includes(setor)) {
      throw new HttpException('Setor não encontrado', HttpStatus.NOT_FOUND);
    }
    const files = await this.S3.getAllFiles(setor);
    const videos = await this.Service.getAllVideos();

    const lista = {
      pdf: files?.pdf || [],
      doc: files?.doc || [],
      img: files?.img || [],
      audio: files?.audio || [],
      video: videos || [],
    };
    
    return lista;
  }

  @Get(':setor/:filename')
  @ApiOperation({
    summary: 'preview do arquivo',
    description:
      'Endpoint para preview de arquivos. essa rota redireciona para a URL de visualização do arquivo.',
  })
  @ApiParam({
    name: 'setor',
    required: true,
    description: 'Nome do setor (ex: cnh, doc, chamado, suporte)',
    example: 'doc',
  })
  @ApiParam({
    name: 'filename',
    required: true,
    description: 'Nome do arquivo armazenado no S3',
    example: 'meuarquivo.pdf',
  })
  @ApiResponse({
    status: 302,
    description: 'Redireciona para a URL do arquivo no S3',
    headers: {
      Location: {
        description: 'URL do arquivo no S3',
        schema: {
          type: 'string',
          format: 'uri',
          example: 'https://s3.amazonaws.com/bucket/meuarquivo.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Setor ou arquivo não encontrado',
    content: {
      'application/json': {
        example: {
          error: 'Setor não encontrado',
        },
      },
    },
  })
  async findView(
    @Param('setor') setor: string,
    @Param('filename') filename: string,
    @Res() response: Response, // Injeta o Response do Express
  ) {
    if (!this.Setores.includes(setor)) {
      throw new HttpException('Setor não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!filename) {
      throw new HttpException('Arquivo não encontrado', HttpStatus.NOT_FOUND);
    }

    const s3file = await this.S3.getFileUrl(setor, filename);
    return response.redirect(s3file);
  }

  @Get('download/:setor/:filename')
  @ApiOperation({
    summary: 'Download de arquivo',
    description:
      'Endpoint para baixar arquivos armazenados no S3. Retorna o arquivo diretamente como um anexo.',
  })
  @ApiParam({
    name: 'setor',
    required: true,
    description: 'Nome do setor (ex: cnh, doc, chamado, suporte)',
    example: 'doc',
  })
  @ApiParam({
    name: 'filename',
    required: true,
    description: 'Nome do arquivo a ser baixado',
    example: 'meuarquivo.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo baixado com sucesso',
    content: {
      'application/octet-stream': {
        example: 'Binary data representing the file',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Setor ou arquivo não encontrado',
    content: {
      'application/json': {
        example: {
          error: 'Setor ou arquivo não encontrado',
        },
      },
    },
  })
  async findDownload(
    @Param('setor') setor: string,
    @Param('filename') filename: string,
    @Res() resp: Response,
  ) {
    if (!this.Setores.includes(setor)) {
      throw new HttpException('Setor não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!filename) {
      throw new HttpException('Arquivo não encontrado', HttpStatus.NOT_FOUND);
    }

    const file = await this.S3.downloadFile(setor, filename);
    const Mine = file.ContentType;
    resp.set('Content-Type', Mine || 'application/octet-stream');
    resp.set('Content-Disposition', `attachment; filename="${filename}"`);
    resp.send(file.buffer);
  }

  @Delete(':setor/:filename')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Excluir um arquivo',
    description:
      'Endpoint para deletar um arquivo do S3. O arquivo será removido permanentemente.',
  })
  @ApiParam({
    name: 'setor',
    required: true,
    description: 'Nome do setor (ex: cnh, doc, chamado, suporte)',
    example: 'doc',
  })
  @ApiParam({
    name: 'filename',
    required: true,
    description: 'Nome do arquivo a ser deletado',
    example: 'meuarquivo.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo excluído com sucesso',
    content: {
      'application/json': {
        example: {
          message: 'Arquivo excluído com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Setor ou arquivo não encontrado',
    content: {
      'application/json': {
        example: {
          error: 'Setor ou arquivo não encontrado',
        },
      },
    },
  })
  async remove(
    @Param('setor') setor: string,
    @Param('filename') filename: string,
  ) {
    if (!this.Setores.includes(setor)) {
      throw new HttpException('Setor não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!filename) {
      throw new HttpException('Arquivo não encontrado', HttpStatus.NOT_FOUND);
    }
    await this.S3.deleteAllFiles(setor, filename);
    return { message: 'Arquivo excluido com sucesso' };
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
