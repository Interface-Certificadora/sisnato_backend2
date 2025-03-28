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
import { EmpreendimentoService } from './empreendimento.service';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Empreendimento } from './entities/empreendimento.entity';
import { ErrorEmpreendimentoEntity } from './entities/empreendimento.error.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('empreendimento')
export class EmpreendimentoController {
  constructor(private readonly empreendimentoService: EmpreendimentoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Empreendimento criado com sucesso',
    type: Empreendimento,
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    type: ErrorEmpreendimentoEntity,
  })
  async create(@Body() createEmpreendimentoDto: CreateEmpreendimentoDto) {
    return await this.empreendimentoService.create(createEmpreendimentoDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retorna todos os empreendimentos',
    type: [Empreendimento],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao requisitar empreendimentos',
    type: ErrorEmpreendimentoEntity,
  })
  async findAll(@Req() req: any) {
    return await this.empreendimentoService.findAll(req.user);
  }

  @Get('/search')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description:
      'Retorna todos os empreendimentos relacionados a financeira e construtora',
    type: [Empreendimento],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao requisitar empreendimentos',
    type: ErrorEmpreendimentoEntity,
  })
  async GetAllSearch(@Req() req: any, @Query() query: any) {
    const { financeira, construtora } = query;
    return await this.empreendimentoService.GetAllSearch(
      +financeira,
      +construtora,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retorna um empreendimento específico',
    type: Empreendimento,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao requisitar empreendimento',
    type: ErrorEmpreendimentoEntity,
  })
  async findOne(@Param('id') id: string) {
    return await this.empreendimentoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Empreendimento atualizado com sucesso',
    type: Empreendimento,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar empreendimento',
    type: ErrorEmpreendimentoEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmpreendimentoDto: UpdateEmpreendimentoDto,
  ) {
    return await this.empreendimentoService.update(+id, updateEmpreendimentoDto);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Empreendimento desativado com sucesso',
    type: Empreendimento,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao desativar empreendimento',
    type: ErrorEmpreendimentoEntity,
  })
  async remove(@Param('id') id: string) {
    return await this.empreendimentoService.remove(+id);
  }

  @Get('/filter/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retorna todos os empreendimentos relacionados a construtora',
    type: [Empreendimento],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao requisitar empreendimentos',
    type: ErrorEmpreendimentoEntity,
  })
  async GetByConstrutora(@Param('id') id: string) {
    return await this.empreendimentoService.GetByConstrutora(+id);
  }
  
}
