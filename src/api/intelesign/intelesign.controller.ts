import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ErrorEntity } from 'src/entities/error.entity';
import { GetInfoSolicitacaoEntity } from '../get-infos/entities/get-info-solicitacao-entity';
import { GetInfoErrorEntity } from '../get-infos/entities/get-info.error.entity';
import { CreateIntelesignDto } from './dto/create-intelesign.dto';
import { QueryDto } from './dto/query.dto';
import { IntelesignAllEntity } from './entities/intelesign.entity';
import { StatusEntity } from './entities/status/status.entity';
import { IntelesignService } from './intelesign.service';

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
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createIntelesignDto: CreateIntelesignDto, // Idealmente usar o DTO tipado
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    try {
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
  async findAll(@Req() req: any, @Query() query: QueryDto) {
    return await this.intelesignService.findAll(query, req.user);
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
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.intelesignService.findOne(+id, req.user);
  }

  @Get('/status/:id')
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
  async findOneStatus(@Param('id') id: string) {
    return await this.intelesignService.findOneStatus(+id);
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

  @Get('/checkcpf/:cpf')
  @ApiOperation({
    summary: 'Verifica se o CPF existe no banco',
    description: 'Verifica se o CPF existe no banco',
  })
  @ApiOkResponse({
    description: 'Verifica se o CPF existe no banco',
    type: [GetInfoSolicitacaoEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na requisição',
    type: GetInfoErrorEntity,
  })
  async checkCpf(@Param('cpf') cpf: string) {
    return await this.intelesignService.IsExist(cpf);
  }
}
