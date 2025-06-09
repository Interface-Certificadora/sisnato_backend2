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
import { DiretoService } from './direto.service';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Direto } from './entities/direto.entity';
import { ErrorDiretoEntity } from './entities/erro.direto.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { AllDireto } from './entities/direto.list.entity';

@Controller('direto')
export class DiretoController {
  constructor(private readonly diretoService: DiretoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um novo cliente Direto',
    description: 'Cria um novo cliente Direto',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
    type: Direto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar cliente',
    type: ErrorDiretoEntity,
  })
  async create(@Body() createDiretoDto: CreateDiretoDto) {
    return await this.diretoService.create(createDiretoDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todos os clientes Direto',
    description: 'Busca todos os clientes Direto',
  })
  @ApiResponse({
    status: 200,
    description: 'Clientes encontrados com sucesso',
    type: [AllDireto],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar clientes',
    type: ErrorDiretoEntity,
  })
  async findAll(): Promise<AllDireto[]> {
    return await this.diretoService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca um cliente Direto',
    description: 'Busca um cliente Direto',
  })
  @ApiParam({
    name: 'id',
    description: 'Id do cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso',
    type: Direto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar cliente',
    type: ErrorDiretoEntity,
  })
  async findOne(@Param('id') id: string): Promise<Direto> {
    return await this.diretoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um cliente Direto',
    description: 'Atualiza um cliente Direto',
  })
  @ApiParam({
    name: 'id',
    description: 'Id do cliente',
  })
  @ApiBody({
    type: UpdateDiretoDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
    type: Direto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar cliente',
    type: ErrorDiretoEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDiretoDto: UpdateDiretoDto,
    @Req() req: any,
  ): Promise<Direto> {
    return await this.diretoService.update(+id, updateDiretoDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desativa um cliente Direto',
    description: 'Desativa um cliente Direto',
  })
  @ApiParam({
    name: 'id',
    description: 'Id do cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente deletado com sucesso',
    type: Direto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao deletar cliente',
    type: ErrorDiretoEntity,
  })
  async remove(@Param('id') id: string, @Req() req: any): Promise<Direto> {
    return await this.diretoService.remove(+id, req.user);
  }
}
