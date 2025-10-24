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
import { DiretoTagService } from './direto-tag.service';
import { CreateDiretoTagDto } from './dto/create-direto-tag.dto';
import { UpdateDiretoTagDto } from './dto/update-direto-tag.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiretoTagEntity } from './entities/direto-tag.entity';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('direto-tag')
export class DiretoTagController {
  constructor(private readonly diretoTagService: DiretoTagService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma tag para o direto',
    description: 'Endpoint para criar uma tag para o direto',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag criada com sucesso',
    type: DiretoTagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar tag',
    example: {
      message: 'Erro ao criar tag',
    },
  })
  async create(
    @Body() createDiretoTagDto: CreateDiretoTagDto,
    @Req() req: any,
  ) {
    return await this.diretoTagService.create(createDiretoTagDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna todas as tags',
    description: 'Endpoint para retornar todas as tags',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna todas as tags',
    type: [DiretoTagEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tags',
    example: {
      message: 'Erro ao buscar tags',
    },
  })
  findAll() {
    return this.diretoTagService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna uma tag pelo id',
    description: 'Endpoint para retornar uma tag pelo id',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma tag pelo id',
    type: DiretoTagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tag pelo id',
    example: {
      message: 'Erro ao buscar tag pelo id',
    },
  })
  async findOne(@Param('id') id: string) {
    return await this.diretoTagService.findOne(+id);
  }
  @Get('direto/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna uma tag pelo id do direto',
    description: 'Endpoint para retornar uma tag pelo id do direto',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma tag pelo id do direto',
    type: DiretoTagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tag pelo id do direto',
    example: {
      message: 'Erro ao buscar tag pelo id do direto',
    },
  })
  async findAllByDireto(@Param('id') id: string) {
    return await this.diretoTagService.findDiretoAll(+id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove uma tag pelo id',
    description: 'Endpoint para remover uma tag pelo id',
  })
  @ApiResponse({
    status: 200,
    description: 'Remove uma tag pelo id',
    type: DiretoTagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover tag pelo id',
    example: {
      message: 'Erro ao remover tag pelo id',
    },
  })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.diretoTagService.remove(+id, req.user);
  }
}
