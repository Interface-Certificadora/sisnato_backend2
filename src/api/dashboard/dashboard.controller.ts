import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardEmpreendimentoEntity } from './entities/dashboard.empreendimento.entity';
import { DashboardConstrutorasEntity } from './entities/dashboard.construtoras.entity';
import { ErrorDashboardEntity } from './entities/dashboard.error.entity';
import { DashboardFinanceirasEntity } from './entities/dashboard.financeiras.entity';
import { Dashboard } from './entities/dashboard.entity';
import { FiltroDashboardDto } from './dto/filtro-dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/empreendimentos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna os empreendimentos',
    description: 'Retorna os empreendimentos cadastrados no banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os empreendimentos',
    type: [DashboardEmpreendimentoEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum empreendimento encontrado',
    type: ErrorDashboardEntity,
  })
  async getEmpreendimentos() {
    return await this.dashboardService.getEmpreendimentos();
  }

  @Get('/construtoras')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna as construtoras',
    description: 'Retorna as construtoras cadastradas no banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna as construtoras',
    type: [DashboardConstrutorasEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma construtora encontrada',
    type: ErrorDashboardEntity,
  })
  async getConstrutoras() {
    return await this.dashboardService.getConstrutoras();
  }

  @Get('/financeiras')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna as financeiras',
    description: 'Retorna as financeiras cadastradas no banco de dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna as financeiras',
    type: [DashboardFinanceirasEntity],
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma financeira encontrada',
    type: ErrorDashboardEntity,
  })
  async getFinanceiras() {
    return await this.dashboardService.getFinanceiras();
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna o Dashboard Global',
    description: 'Retorna o Dashboard Global',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna o Dashboard Global',
    type: Dashboard,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na requisição',
    type: ErrorDashboardEntity,
  })
  async getDashboard() {
    return await this.dashboardService.getDashboard();
  }

  @Post('/get/infos/search')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna o DashBoard com os filtros aplicados',
    description: 'Retorna o DashBoard com os filtros aplicados',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna o DashBoard com os filtros aplicados',
    type: Dashboard,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na requisição',
    type: ErrorDashboardEntity,
  })
  async getDashboardSearch(@Body() FiltroDashboardDto: FiltroDashboardDto) {
    return await this.dashboardService.getDashboardSearch(FiltroDashboardDto);
  }
}
