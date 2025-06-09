import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FichaService } from './ficha.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Ficha } from './entities/ficha.entity';
import { ErrorEntity } from 'src/entities/error.entity';


@Controller('ficha')
export class FichaController {
  constructor(private readonly fichaService: FichaService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma ficha',
    description: 'Cria uma ficha',
  })
  @ApiBody({
    type: CreateFichaDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Ficha criada com sucesso',
    type: Ficha,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar ficha',
    type: ErrorEntity,
  })
  create(@Body() createFichaDto: CreateFichaDto) {
    return this.fichaService.create(createFichaDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todas as fichas',
    description: 'Busca todas as fichas',
  })
  @ApiResponse({
    status: 200,
    description: 'Fichas encontradas com sucesso',
    type: [Ficha],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar fichas',
    type: ErrorEntity,
  })
  findAll() {
    return this.fichaService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca uma ficha',
    description: 'Busca uma ficha',
  })
  @ApiParam({
    name: 'id',
    description: 'Id da ficha',
  })
  @ApiResponse({
    status: 200,
    description: 'Ficha encontrada com sucesso',
    type: Ficha,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar ficha',
    type: ErrorEntity,
  })
  findOne(@Param('id') id: string) {
    return this.fichaService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza uma ficha',
    description: 'Atualiza uma ficha',
  })
  @ApiParam({
    name: 'id',
    description: 'Id da ficha',
  })
  @ApiBody({
    type: UpdateFichaDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Ficha atualizada com sucesso',
    type: Ficha,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar ficha',
    type: ErrorEntity,
  })
  update(@Param('id') id: string, @Body() updateFichaDto: UpdateFichaDto) {
    return this.fichaService.update(+id, updateFichaDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta uma ficha',
    description: 'Deleta uma ficha',
  })
  @ApiParam({
    name: 'id',
    description: 'Id da ficha',
  })
  @ApiResponse({
    status: 200,
    description: 'Ficha deletada com sucesso',
    type: Ficha,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao deletar ficha',
    type: ErrorEntity,
  })
  remove(@Param('id') id: string) {
    return this.fichaService.remove(+id);
  }
}
