import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ImportVoucherJsonDto } from './dto/import-voucher.dto';
import { VincularVoucherDto } from './dto/vincular-voucher.dto';
import { VoucherEntity } from './entities/voucher.entity';
import { VoucherStatus } from '@prisma/client';
import { QueryVoucherDto } from './dto/query-voucher.dto';

@ApiTags('Gestão de Vouchers (S-Deal)')
@ApiBearerAuth()
@Controller('voucher')
@UseGuards(AuthGuard)
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar Vouchers com Filtro',
    description: 'Retorna vouchers paginados e filtrados.',
  })
  @ApiResponse({ status: 200, type: [VoucherEntity] })
  // A MÁGICA ACONTECE AQUI:
  async listar(@Query() query: QueryVoucherDto) {
    return this.voucherService.findAll(query);
  }

  @Post('vincular')
  @ApiOperation({
    summary: 'Vincular Voucher a Cliente (Gestão Local)',
    description:
      'Reserva um voucher do estoque (Verde/Azul) para um cliente no banco de dados local. Se não houver estoque, compra um voucher genérico na Soluti.',
  })
  @ApiBody({ type: VincularVoucherDto })
  @ApiResponse({ status: 201, description: 'Vínculo realizado com sucesso.' })
  async vincular(@Body() body: VincularVoucherDto) {
    return this.voucherService.vincularVoucher(body);
  }

  @Patch('verificar/:id')
  @ApiOperation({
    summary: 'Sincronizar Status e Resolver Conflitos',
    description:
      'Consulta a API da Soluti para ver se o voucher já virou certificado. Se o CPF de quem usou for diferente do vinculado, atualiza o dono.',
  })
  @ApiParam({ name: 'id', type: Number })
  async verificar(@Param('id', ParseIntPipe) id: number) {
    return this.voucherService.sincronizarStatus(id);
  }

  @Post('importar-json')
  @ApiOperation({
    summary: 'Importar Lote JSON (Carga de Estoque)',
    description:
      'Recebe o JSON do sistema legado, ignora campos extras e carrega os códigos como estoque DISPONÍVEL (Verde).',
  })
  @ApiBody({ type: ImportVoucherJsonDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: { status: 'success', novos_inseridos: 10, mensagem: '...' },
    },
  })
  async importarJson(@Body() body: any) {
    return this.voucherService.importarJson(body);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas de Vouchers',
    description: 'Retorna a contagem de vouchers por status.',
  })
  async stats() {
    return this.voucherService.getStats();
  }

  @Get('testar-cron')
  async testarCron() {
    await this.voucherService.handleCronVouchers();
    return 'Cron executado manual';
  }
}
