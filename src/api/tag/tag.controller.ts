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
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagEntity } from './entities/tag.entity';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma tag',
    description: 'Endpoint para criar uma tag',
  })
  @ApiResponse({
    status: 201,
    description: 'Tag criada com sucesso',
    type: TagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar tag',
    example: {
      message: 'Erro ao criar tag',
    },
  })
  create(@Body() createTagDto: CreateTagDto, @Req() req: any) {
    return this.tagService.create(createTagDto, req.user);
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
    type: [TagEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tags',
    example: {
      message: 'Erro ao buscar tags',
    },
  })
  findAll() {
    return this.tagService.findAll();
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
    type: TagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tag pelo id',
    example: {
      message: 'Erro ao buscar tag pelo id',
    },
  })
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza uma tag pelo id',
    description: 'Endpoint para atualizar uma tag pelo id',
  })
  @ApiResponse({
    status: 200,
    description: 'Atualiza uma tag pelo id',
    type: TagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar tag pelo id',
    example: {
      message: 'Erro ao atualizar tag pelo id',
    },
  })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto, @Req() req: any) {
    return this.tagService.update(+id, updateTagDto, req.user);
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
    type: TagEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover tag pelo id',
    example: {
      message: 'Erro ao remover tag pelo id',
    },
  })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tagService.remove(+id, req.user);
  }
}
