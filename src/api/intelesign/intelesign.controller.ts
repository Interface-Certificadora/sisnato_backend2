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
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { IntelesignService } from './intelesign.service';
import { CreateIntelesignDto } from './dto/create-intelesign.dto';
import { UpdateIntelesignDto } from './dto/update-intelesign.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { ErrorEntity } from 'src/entities/error.entity';
import { IntelesignAllEntity } from './entities/intelesign.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { QueryDto } from './dto/query.dto';
import { StatusEntity } from './entities/status/status.entity';

@Controller('intelesign')
export class IntelesignController {
  constructor(private readonly intelesignService: IntelesignService) {}

  private createErrorResponse(message: string, status: number) {
    return {
      error: true,
      message,
      status,
      data: null,
      total: 0,
      page: 0,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Cria um novo envelope.',
    description:
      'Rota para criar um novo envelope, recebendo um arquivo e as informações do envelope via FormData.',
  })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //         description: 'Arquivo do envelope para assinatura',
  //       },
  //       signatarios: {
  //         type: 'string',
  //         description: 'Array de signatários',
  //         example:
  //           '[{"nome": "Nome do signatário", "email": "email@exemplo.com", "cpf": "12345678901234"}]',
  //       },
  //       valor: {
  //         type: 'number',
  //         description: 'Valor do documento',
  //         example: 100.0,
  //       },
  //       cca_id: {
  //         type: 'string',
  //         description: 'ID do CCA',
  //         example: '1',
  //       },
  //       const_id: {
  //         type: 'number',
  //         description: 'ID do construtora',
  //         example: '1',
  //       },
  //       title: {
  //         type: 'string',
  //         description: 'Titulo do envelope',
  //         default: '`SisNato - Assinatura de documento`',
  //       },
  //       subject: {
  //         type: 'string',
  //         description: 'Subtitulo do envelope',
  //         default: `Contrato de financiamento de imóvel`,
  //       },
  //       message: {
  //         type: 'string',
  //         description: 'Mensagem do envelope',
  //         default: `Por favor, assine o documento para prosseguir com o processo de financiamento de imóvel.`,
  //       },
  //       expire_at: {
  //         type: 'number',
  //         description: 'Dias de expiração do envelope',
  //         default: 7,
  //       },
  //       type: {
  //         type: 'string',
  //         description: 'Tipo de assinatura utilizada no envelope',
  //         enum: ['simple', 'qualified'],
  //         default: 'qualified',
  //       },
  //     },
  //     required: [
  //       'file',
  //     ], // Defina os campos obrigatórios
  //   },
  // })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createIntelesignDto: CreateIntelesignDto, // Idealmente usar o DTO tipado
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    try {
      console.log("🚀 ~ IntelesignController ~ create ~ createIntelesignDto:", createIntelesignDto)
      return this.intelesignService.create(createIntelesignDto, file, req.user);
    } catch (error) {
      return this.createErrorResponse(error.message, error.status);
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todas os registros de envelopes.',
    description:
      'Rota para buscar todas os registros de envelopes, com paginação e filtros.',
  })
  @ApiOkResponse({
    description: 'Busca todas os registros de envelopes.',
    type: IntelesignAllEntity,
  })
  @ApiNotFoundResponse({
    description: 'Erro ao buscar Solicitações.',
    type: ErrorEntity,
  })
  findAll(@Req() req: any, @Query() query: QueryDto) {
    try {
      return this.intelesignService.findAll(query, req.user);
    } catch (error) {
      return this.createErrorResponse(error.message, error.status);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca um registro de envelope.',
    description:
      'Rota para buscar um registro de envelope, com paginação e filtros.',
  })
  @ApiOkResponse({
    description: 'Busca um registro de envelope.',
    type: IntelesignAllEntity,
  })
  @ApiNotFoundResponse({
    description: 'Erro ao buscar Solicitações.',
    type: ErrorEntity,
  })
  findOne(@Param('id') id: string, @Req() req: any) {
    try {
      return this.intelesignService.findOne(+id, req.user);
    } catch (error) {
      return this.createErrorResponse(error.message, error.status);
    }
  }

  @Get('/status/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca o status de um envelope.',
    description: 'Rota para buscar o status de um envelope.',
  })
  @ApiOkResponse({
    description: 'Busca o status de um envelope.',
    type: StatusEntity,
    example: StatusEntity,
  })
  @ApiNotFoundResponse({
    description: 'Erro ao buscar o status de um envelope.',
    type: ErrorEntity,
  })
  findOneStatus(@Param('id') id: string) {
    try {
      return this.intelesignService.findOneStatus(+id);
    } catch (error) {
      return this.createErrorResponse(error.message, error.status);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exclui um registro de envelope.',
    description:
      'Rota para excluir um registro de envelope, com paginação e filtros.',
  })
  @ApiOkResponse({
    description: 'Exclui um registro de envelope.',
    type: IntelesignAllEntity,
  })
  @ApiNotFoundResponse({
    description: 'Erro ao buscar Solicitações.',
    type: ErrorEntity,
  })
  remove(@Param('id') id: string, @Req() req: any) {
    try {
      return this.intelesignService.remove(+id, req.user);
    } catch (error) {
      return this.createErrorResponse(error.message, error.status);
    }
  }
}
