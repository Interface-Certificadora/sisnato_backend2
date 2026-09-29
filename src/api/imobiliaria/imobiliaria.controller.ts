import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateImobiliariaDto } from './dto/create-imobiliaria.dto';
import { UpdateImobiliariaDto } from './dto/update-imobiliaria.dto';
import {
  ErrorImobiliariaEntity,
  Imobiliaria,
} from './entities/imobiliaria.entity';
import { ImobiliariaService } from './imobiliaria.service';

@Controller('imobiliaria')
export class ImobiliariaController {
  constructor(private readonly imobiliariaService: ImobiliariaService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar imobiliária',
    description: 'Cria uma nova imobiliária',
  })
  @ApiBody({ type: CreateImobiliariaDto })
  @ApiResponse({ status: 201, type: Imobiliaria })
  @ApiResponse({ status: 400, type: ErrorImobiliariaEntity })
  async create(
    @Body() createImobiliariaDto: CreateImobiliariaDto,
    @Req() req: any,
  ) {
    return await this.imobiliariaService.create(createImobiliariaDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar imobiliárias',
    description:
      'ADM vê todas; demais usuários veem apenas as imobiliárias ativas às quais estão vinculados',
  })
  @ApiResponse({ status: 200, type: [Imobiliaria] })
  async findAll(@Req() req: any) {
    return await this.imobiliariaService.findAll(req.user);
  }

  @Get('select')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar imobiliárias ativas para seleção',
    description:
      'Lista enxuta (id, fantasia, razaosocial) usada no cadastro de usuário e na criação de envelope. ADM vê todas; demais usuários apenas as relacionadas a eles.',
  })
  async findSelect(@Req() req: any) {
    return await this.imobiliariaService.findSelect(req.user);
  }

  @Get('search')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Filtrar imobiliárias' })
  async search(@Query() query: any, @Req() req: any) {
    return await this.imobiliariaService.search(query, req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar imobiliária pelo id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: Imobiliaria })
  @ApiResponse({ status: 404, type: ErrorImobiliariaEntity })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.imobiliariaService.findOne(+id, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar imobiliária' })
  @ApiBody({ type: UpdateImobiliariaDto })
  @ApiResponse({ status: 200, type: Imobiliaria })
  async update(
    @Param('id') id: string,
    @Body() updateImobiliariaDto: UpdateImobiliariaDto,
    @Req() req: any,
  ) {
    return await this.imobiliariaService.update(
      +id,
      updateImobiliariaDto,
      req.user,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir imobiliária (somente ADM)' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.imobiliariaService.remove(+id, req.user);
  }
}
