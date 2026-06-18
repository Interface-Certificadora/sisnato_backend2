import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AgenteService } from './agente.service';
import { ConsultarClienteTelefoneDto } from './dto/consultar-cliente.dto';
import { AgenteAuthGuard } from './agente-auth.guard';

@Controller('agente')
@UseGuards(AgenteAuthGuard)
export class AgenteController {
  constructor(private readonly agenteService: AgenteService) {}

  @Get('clientes/por-telefone')
  @HttpCode(HttpStatus.OK)
  async consultarPorTelefone(@Query() query: ConsultarClienteTelefoneDto) {
    return this.agenteService.buscarClientePorTelefone(query.telefone);
  }
}
