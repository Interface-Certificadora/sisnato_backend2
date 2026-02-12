import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GeoService } from './geo.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Geolocalização')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('estados')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar Estados',
    description: 'Retorna todos os estados cadastrados',
  })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  async getEstados() {
    return this.geoService.listarEstados();
  }

  @Get('cidades/:estadoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar Cidades por Estado',
    description: 'Retorna as cidades de um estado específico',
  })
  @ApiParam({ name: 'estadoId', type: Number })
  async getCidades(@Param('estadoId', ParseIntPipe) estadoId: number) {
    return this.geoService.listarCidadesPorEstado(estadoId);
  }

  @Get('proximas-unidades/:cidadeId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Encontrar Unidades Próximas',
    description:
      'Calcula e retorna as unidades parceiras mais próximas da cidade informada',
  })
  @ApiParam({ name: 'cidadeId', type: Number })
  async getProximasUnidades(@Param('cidadeId', ParseIntPipe) cidadeId: number) {
    return this.geoService.encontrarUnidadesProximas(cidadeId);
  }

  @Get('todas-unidades')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar Todas as Unidades Ativas',
    description:
      'Retorna uma lista simplificada de todas as unidades parceiras para exibição em tabelas',
  })
  @ApiResponse({ status: 200, description: 'Sucesso' })
  async getTodasUnidades() {
    return this.geoService.listarTodasUnidades();
  }
}
