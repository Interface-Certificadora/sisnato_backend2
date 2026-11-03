import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ErrorEntity } from 'src/entities/error.entity';
import { S3Service } from 'src/s3/s3.service';
import { CreateRelatorioNatosignDto } from './dto/create-relatorio_natosign.dto';
import { PesquisaRelatorioNatosignDto } from './dto/pesquisa-relatorio_natosign.dto';
import { UpdateRelatorioNatosignDto } from './dto/update-relatorio_natosign.dto';
import { RelatorioNatosignService } from './relatorio_natosign.service';

const CONTENT_TYPE = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/**
 * Cobranças dos envelopes NatoSign (por construtora ou por CCA).
 */
@Controller('relatorio-natosign')
@ApiTags('Relatórios financeiros NatoSign')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiResponse({
  status: 400,
  description: 'Erro na operação.',
  type: ErrorEntity,
})
export class RelatorioNatosignController {
  constructor(
    private readonly relatorioNatosignService: RelatorioNatosignService,
    private readonly S3: S3Service,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Gera a cobrança dos envelopes NatoSign.',
    description:
      'Cobra os envelopes concluídos (e não cancelados) de uma construtora OU de uma CCA enviados no período. Antes, sincroniza com a Intellisign o status dos envelopes ainda em aberto.',
  })
  create(@Body() data: CreateRelatorioNatosignDto, @Req() req: any) {
    return this.relatorioNatosignService.create(data, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as cobranças NatoSign ativas.' })
  findAll(@Req() req: any) {
    return this.relatorioNatosignService.findAll(req.user);
  }

  @Get('numeros/geral')
  @ApiOperation({ summary: 'Números gerais das cobranças NatoSign.' })
  relatorioGeral(@Req() req: any) {
    return this.relatorioNatosignService.relatorioGeral(req.user);
  }

  @Post('pesquisa')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Pesquisa cobranças NatoSign.',
    description:
      'Por CNPJ, razão social ou fantasia (construtora ou CCA) ou protocolo.',
  })
  pesquisa(@Body() data: PesquisaRelatorioNatosignDto, @Req() req: any) {
    return this.relatorioNatosignService.pesquisa(data, req.user);
  }

  @Get(':modo/:tipo/:protocolo')
  @ApiOperation({
    summary: 'Abre (view) ou baixa (download) o PDF/XLSX da cobrança.',
    description: 'modo: view | download; tipo: pdf | xlsx.',
  })
  async arquivo(
    @Param('modo') modo: string,
    @Param('tipo') tipo: string,
    @Param('protocolo') protocolo: string,
    @Req() req: any,
    @Res() response: Response,
  ) {
    try {
      if (!['view', 'download'].includes(modo) || !(tipo in CONTENT_TYPE)) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Arquivo não encontrado' });
      }
      const fileName =
        tipo === 'pdf'
          ? await this.relatorioNatosignService.relatorioPdf(
              protocolo,
              req.user,
            )
          : await this.relatorioNatosignService.relatorioXlsx(
              protocolo,
              req.user,
            );
      const arquivo = await this.S3.downloadFile(
        'relatoriofinanceiro',
        fileName,
      );

      response.set({
        'Content-Type': arquivo.ContentType || CONTENT_TYPE[tipo],
        'Content-Disposition': `${modo === 'view' ? 'inline' : 'attachment'}; filename="${fileName}"`,
      });
      return response.status(HttpStatus.OK).send(arquivo.buffer);
    } catch (error) {
      return response.status(error.status || 500).json({
        message: error.message || 'Erro ao gerar arquivo da cobrança',
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma cobrança NatoSign com os envelopes.' })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.relatorioNatosignService.findOne(+id, req.user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza situação, nota fiscal ou data de pagamento.',
    description:
      'Ao marcar como pago (situacao_pg = 2) os envelopes ficam com status_pg "paid".',
  })
  update(
    @Param('id') id: string,
    @Body() data: UpdateRelatorioNatosignDto,
    @Req() req: any,
  ) {
    return this.relatorioNatosignService.update(+id, data, req.user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Exclui a cobrança.',
    description:
      'Os envelopes voltam para pendente de cobrança. Cobrança paga não pode ser excluída.',
  })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.relatorioNatosignService.remove(+id, req.user);
  }
}
