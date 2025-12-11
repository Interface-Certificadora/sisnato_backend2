import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ArParceiraService } from './ar-parceira.service';
import { CreateArParceiraDto } from './dto/create-ar-parceira.dto';
import { UpdateArParceiraDto } from './dto/update-ar-parceira.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArParceira } from './entities/ar-parceira.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('AR Parceiras')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ar-parceira')
export class ArParceiraController {
  constructor(private readonly arParceiraService: ArParceiraService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova AR Parceira' })
  @ApiBody({ type: CreateArParceiraDto })
  @ApiResponse({
    status: 201,
    description: 'Criado com sucesso',
    type: ArParceira,
  })
  async create(@Body() createArParceiraDto: CreateArParceiraDto) {
    return this.arParceiraService.create(createArParceiraDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as AR Parceiras' })
  @ApiResponse({
    status: 200,
    type: [ArParceira],
  })
  async findAll() {
    return this.arParceiraService.findAll();
  }

  @Get('list-acs')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar ACs cadastradas' })
  @ApiResponse({ status: 200, type: [String] })
  async listAcs() {
    return this.arParceiraService.listUniqueAcs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar AR Parceira por ID' })
  @ApiParam({ name: 'id', description: 'ID da Parceira', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Encontrada com sucesso',
    type: ArParceira,
  })
  @ApiResponse({ status: 404, description: 'Não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.arParceiraService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar AR Parceira' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateArParceiraDto })
  @ApiResponse({
    status: 200,
    description: 'Atualizado com sucesso',
    type: ArParceira,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArParceiraDto: UpdateArParceiraDto,
  ) {
    return this.arParceiraService.update(id, updateArParceiraDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover AR Parceira' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Removido com sucesso',
    type: ArParceira,
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.arParceiraService.remove(id);
  }
}
