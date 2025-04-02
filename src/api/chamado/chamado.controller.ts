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
} from '@nestjs/common';
import { ChamadoService } from './chamado.service';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Chamado } from './entities/chamado.entity';
import { ErrorChamadoEntity } from './entities/chamado.error.entity';

@Controller('chamado')
export class ChamadoController {
  constructor(private readonly chamadoService: ChamadoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @ApiResponse({
    status: 200,
    description: 'Chamado removido com sucesso',
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
}
