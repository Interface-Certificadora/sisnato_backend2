import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TagListService } from './tag-list.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagListEntity } from './entities/tag-list.entity';
import { CreateTagsListDto } from './dto/create-tag-list.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('tag-list')
export class TagListController {
  constructor(private readonly tagListService: TagListService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma tagList',
    description: 'Endpoint para criar uma tagList',
  })
  @ApiResponse({
    status: 201,
    description: 'TagList criada com sucesso',
    type: TagListEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar tagList',
    example: {
      message: 'Erro ao criar tagList',
    },
  })
  create(@Body() createTagListDto: CreateTagsListDto) {
    return this.tagListService.create(createTagListDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna todas as tagList',
    description: 'Endpoint para retornar todas as tagList',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna todas as tagList',
    type: [TagListEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tagList',
    example: {
      message: 'Erro ao buscar tagList',
    },
  })
  findAll() {
    return this.tagListService.findAll();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove uma tagList pelo id',
    description: 'Endpoint para remover uma tagList pelo id',
  })
  @ApiResponse({
    status: 200,
    description: 'Remove uma tagList pelo id',
    type: () => {
      message: String;
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover tagList pelo id',
    example: {
      message: 'Erro ao remover tagList pelo id',
    },
  })
  remove(@Param('id') id: string) {
    return this.tagListService.remove(+id);
  }
}
