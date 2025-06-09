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
import { DiretoTagsService } from './direto-tags.service';
import { CreateDiretoTagDto } from './dto/create-direto-tag.dto';
import { UpdateDiretoTagDto } from './dto/update-direto-tag.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DiretoTag } from './entities/direto-tag.entity';

@Controller('direto-tags')
export class DiretoTagsController {
  constructor(private readonly diretoTagsService: DiretoTagsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma tag',
    description: 'Cria uma tag',
  })
  @ApiBody({
    type: CreateDiretoTagDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Tag criada com sucesso',
    type: DiretoTag,
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    type: String,
  })
  create(@Body() createDiretoTagDto: CreateDiretoTagDto) {
    return this.diretoTagsService.create(createDiretoTagDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todas as tags',
    description: 'Busca todas as tags',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags encontradas com sucesso',
    type: [DiretoTag],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tags',
    type: String,
  })
  findAll() {
    return this.diretoTagsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca uma tag',
    description: 'Busca uma tag',
  })
  @ApiParam({
    name: 'id',
    description: 'Id da tag',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag encontrada com sucesso',
    type: DiretoTag,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar tag',
    type: String,
  })
  findOne(@Param('id') id: string) {
    return this.diretoTagsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza uma tag',
    description: 'Atualiza uma tag',
  })
  @ApiParam({
    name: 'id',
    description: 'Id da tag',
  })
  @ApiBody({
    type: UpdateDiretoTagDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Tag atualizada com sucesso',
    type: DiretoTag,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar tag',
    type: String,
  })
  update(
    @Param('id') id: string,
    @Body() updateDiretoTagDto: UpdateDiretoTagDto,
  ) {
    return this.diretoTagsService.update(+id, updateDiretoTagDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta uma tag',
    description: 'Deleta uma tag',
  })
  @ApiParam({
    name: 'id',
    description: 'Id da tag',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag deletada com sucesso',
    type: DiretoTag,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao deletar tag',
    type: String,
  })
  remove(@Param('id') id: string) {
    return this.diretoTagsService.remove(+id);
  }
}
