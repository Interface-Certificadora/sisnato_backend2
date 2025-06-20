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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Empreendimento } from './entities/empreendimento.entity';
import { ErrorEmpreendimentoEntity } from './entities/empreendimento.error.entity';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('empreendimento')
export class EmpreendimentoController {
  constructor(private readonly empreendimentoService: EmpreendimentoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um novo empreendimento',
    description: 'Cria um novo empreendimento',
  })
  @ApiBody({
    type: CreateEmpreendimentoDto,
  })
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
  async create(
    @Body() createEmpreendimentoDto: CreateEmpreendimentoDto,
    @Req() req: any,
  ) {
    return await this.empreendimentoService.create(
      createEmpreendimentoDto,
      req.user,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna todos os empreendimentos',
    description: 'Retorna todos os empreendimentos',
  })
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
  @ApiOperation({
    summary:
      'Retorna todos os empreendimentos relacionados a financeira e construtora',
    description:
      'Retorna todos os empreendimentos relacionados a financeira e construtora',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Parâmetros da query (financeira e construtora)',
    schema: {
      type: 'object',
      properties: {
        financeira: {
          type: 'number',
          example: 1,
          description: 'Id da financeira',
        },
        construtora: {
          type: 'number',
          example: 2,
          description: 'Id da construtora',
        },
      },
      required: ['financeira', 'construtora'],
    },
  })
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
  @ApiOperation({
    summary: 'Retorna um empreendimento específico',
    description: 'Retorna um empreendimento específico',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do empreendimento',
    type: 'number',
  })
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
  @ApiOperation({
    summary: 'Atualiza um empreendimento específico',
    description: 'Atualiza um empreendimento específico',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do empreendimento',
    type: 'number',
  })
  @ApiBody({
    type: UpdateEmpreendimentoDto,
  })
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
    @Req() req: any,
  ) {
    return await this.empreendimentoService.update(
      +id,
      updateEmpreendimentoDto,
      req.user,
    );
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desativa/Ativa um empreendimento específico',
    description: 'Desativa/Ativa um empreendimento específico',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID do empreendimento',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Empreendimento desativado/Ativa com sucesso',
    type: Empreendimento,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao desativar/Ativa empreendimento',
    type: ErrorEmpreendimentoEntity,
  })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.empreendimentoService.remove(+id, req.user);
  }

  @Get('/filter/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna todos os empreendimentos relacionados a construtora',
    description: 'Retorna todos os empreendimentos relacionados a construtora',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID da construtora',
    type: 'number',
  })
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

  @Post('confer/list')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna todos os empreendimentos relacionados a financeira',
    description: 'Retorna todos os empreendimentos relacionados a financeira',
  })
  @ApiBody({
    type: Array,
    description: 'Lista de ids de empreendimentos',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna todos os empreendimentos relacionados a financeira',
    type: [Empreendimento],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao requisitar empreendimentos',
    type: ErrorEmpreendimentoEntity,
  })
  async GetByConfereList(@Body() body: any) {
    return await this.empreendimentoService.GetByConfereList(body);
  }
}
