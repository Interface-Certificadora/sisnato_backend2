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
  //TODO: efetuar teste

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
