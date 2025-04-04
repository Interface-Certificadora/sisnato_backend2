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
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateFinanceiroDto } from './dto/create-financeiro.dto';
import { UpdateFinanceiroDto } from './dto/update-financeiro.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Financeiro } from './entities/financeiro.entity';
import { ErrorFinanceiroEntity } from './entities/financeiro.error.entity';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um financeiro',
    description: 'Cria um financeiro',
  })
  @ApiBody({
    type: CreateFinanceiroDto,
  })
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
  async create(
    @Body() createFinanceiroDto: CreateFinanceiroDto,
    @Req() req: any,
  ) {
    return await this.financeiroService.create(createFinanceiroDto, req.user);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todos os financeiros',
    description: 'Retorna todos os financeiros',
  })
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca um financeiro',
    description: 'Retorna um financeiro',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do financeiro',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna um financeiro',
    type: Financeiro,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar financeiro',
    type: ErrorFinanceiroEntity,
  })
  async findOne(@Param('id') id: string) {
    return await this.financeiroService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um financeiro',
    description: 'Atualiza um financeiro pelo seu id ',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do financeiro',
    type: String,
  })
  @ApiBody({
    type: UpdateFinanceiroDto,
  })
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
  async update(
    @Param('id') id: string,
    @Body() updateFinanceiroDto: UpdateFinanceiroDto,
    @Req() req: any,
  ) {
    return await this.financeiroService.update(
      +id,
      updateFinanceiroDto,
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta um financeiro',
    description: 'Deleta um financeiro pelo seu id ',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do financeiro',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Financeiro deletado com sucesso',
    type: Financeiro,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao deletar financeiro',
    type: ErrorFinanceiroEntity,
  })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.financeiroService.remove(+id, req.user);
  }
}
