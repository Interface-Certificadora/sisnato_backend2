import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
  Req,
  Post,
} from '@nestjs/common';
import { AgenteService } from './agente.service';
import { ConsultarClienteTelefoneDto } from './dto/consultar-cliente.dto';
import { AgenteAuthGuard } from './agente-auth.guard';
import { ConsultarHorariosDto } from './dto/consultar-horarios.dto';
import { CreateFcwebAgenteDto } from './dto/create-fcweb-agente.dto';

@Controller('agente')
@UseGuards(AgenteAuthGuard)
export class AgenteController {
  constructor(private readonly agenteService: AgenteService) {}

  @Get('clientes/por-telefone')
  @HttpCode(HttpStatus.OK)
  async consultarPorTelefone(@Query() query: ConsultarClienteTelefoneDto) {
    return this.agenteService.buscarClientePorTelefone(query.telefone);
  }

  @Get('agendamentos/horarios')
  @HttpCode(HttpStatus.OK)
  async consultarHorariosDisponiveis() {
    return this.agenteService.listarHorariosDisponiveis();
  }

  @Post('agendamentos/criar-fcweb')
  @HttpCode(HttpStatus.CREATED)
  async criarFcwebViaAgente(
    @Body() data: CreateFcwebAgenteDto,
    @Req() req: any,
  ) {
    return this.agenteService.criarFcwebPeloAgente(data, req.user);
  }
}
