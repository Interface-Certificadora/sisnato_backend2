import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Financeiro } from './entities/financeiro.entity';
import { ErrorFinanceiroEntity } from './entities/financeiro.error.entity';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Financeiro criado com sucesso',
    type: Financeiro,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar financeiro',
    type: ErrorFinanceiroEntity,
  })
  async create(@Body() createFinanceiroDto: CreateFinanceiroDto, @Req() req: any) {
    return await this.financeiroService.create(createFinanceiroDto);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retorna todos os financeiros',
    type: [Financeiro],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar financeiros',
    type: ErrorFinanceiroEntity,
  })
  async findAll() {
    return await this.financeiroService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.financeiroService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Financeiro atualizado com sucesso',
    type: Financeiro,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar financeiro',
    type: ErrorFinanceiroEntity,
  })
  async update(@Param('id') id: string, @Body() updateFinanceiroDto: UpdateFinanceiroDto) {
    return await this.financeiroService.update(+id, updateFinanceiroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financeiroService.remove(+id);
  }
}
