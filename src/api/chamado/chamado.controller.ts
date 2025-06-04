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
  async create(@Body() createChamadoDto: CreateChamadoDto, @Req() req: any) {
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
  async findAll(@Req() req: any) {
    return await this.chamadoService.findAll(req.user);
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
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do chamado',
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
  async update(
    @Param('id') id: string,
    @Body() updateChamadoDto: UpdateChamadoDto,
    @Req() req: any,
  ) {
    return await this.chamadoService.update(+id, updateChamadoDto, req.user);
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
