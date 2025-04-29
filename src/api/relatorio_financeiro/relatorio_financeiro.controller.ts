import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { RelatorioFinanceiroService } from './relatorio_financeiro.service';
import { CreateRelatorioFinanceiroDto } from './dto/create-relatorio_financeiro.dto';
import { UpdateRelatorioFinanceiroDto } from './dto/update-relatorio_financeiro.dto';
import { CreateRelatorioDto } from './dto/relatorio.tdo';
import { Response } from 'express';
import { S3Service } from 'src/s3/s3.service';

/**
 * Controller responsável pelos endpoints de relatórios financeiros.
 * Segue boas práticas de Clean Code e SOLID.
 */
@Controller('relatorio')
export class RelatorioFinanceiroController {
  constructor(
    private readonly relatorioFinanceiroService: RelatorioFinanceiroService,
    private readonly S3: S3Service,
  ) {}

  @Post()
  create(@Body() data: CreateRelatorioFinanceiroDto) {
    return this.relatorioFinanceiroService.create(data);
  }

  /**
   * Endpoint para visualizar PDF no navegador.
   * Usa Content-Disposition: inline para abrir o PDF no browser.
   */
  @Get('view/pdf/:protocolo')
  async relatorioFinanceiroPdf(
    @Param('protocolo') protocolo: string,
    @Res() response: Response,
  ) {
    try {
      const req =
        await this.relatorioFinanceiroService.relatorioFinanceiroPdf(protocolo);

        const buffer = await this.S3.downloadFile('relatoriofinanceiro', req);
        
        response.set({
          'Content-Type': buffer.ContentType || 'application/pdf',
          'Content-Disposition': `inline; filename="${req}"`,
        });
      return response.status(HttpStatus.OK).send(buffer.buffer);
    } catch (error) {
      return response.status(error.status || 500).json({
        mensagem: error.message || 'Erro ao gerar relatório financeiro',
      });
    }
  }

  /**
   * Endpoint para download do PDF.
   * Usa Content-Disposition: attachment para forçar o download.
   */
  @Get('download/pdf/:protocolo')
  async downloadRelatorioFinanceiroPdf(
    @Param('protocolo') protocolo: string,
    @Res() response: Response,
  ) {
    try {
      const req =
        await this.relatorioFinanceiroService.relatorioFinanceiroPdf(protocolo);
        
        const buffer = await this.S3.downloadFile('relatoriofinanceiro', req);

        response.set({
          'Content-Type': buffer.ContentType || 'application/pdf',
          'Content-Disposition': `attachment; filename="${req}"`,
        });

      return response.status(HttpStatus.OK).send(buffer.buffer);
    } catch (error) {
      return response.status(error.status || 500).json({
        mensagem: error.message || 'Erro ao baixar relatório financeiro',
      });
    }
  }


  @Get('view/xlsx/:protocolo')
  async relatorioFinanceiroXlsx(
    @Param('protocolo') protocolo: string,
    @Res() response: Response,
  ) {
    try {
      const req =
        await this.relatorioFinanceiroService.relatorioFinanceiroXlsx(protocolo);

      const buffer = await this.S3.downloadFile('relatoriofinanceiro', req);

      response.set({
        'Content-Type': buffer.ContentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `inline; filename="${req}"`,
      });
      return response.status(HttpStatus.OK).send(buffer.buffer);
    } catch (error) {
      return response.status(error.status || 500).json({
        mensagem: error.message || 'Erro ao gerar relatório financeiro',
      });
    }
  }

  @Get('download/xlsx/:protocolo')
  async downloadRelatorioFinanceiroXlsx(
    @Param('protocolo') protocolo: string,
    @Res() response: Response,
  ) {
    try {
      const req =
        await this.relatorioFinanceiroService.relatorioFinanceiroXlsx(protocolo);

      const buffer = await this.S3.downloadFile('relatoriofinanceiro', req);

      response.set({
        'Content-Type': buffer.ContentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${req}"`,
      });
      return response.status(HttpStatus.OK).send(buffer.buffer);
    } catch (error) {
      return response.status(error.status || 500).json({
        mensagem: error.message || 'Erro ao baixar relatório financeiro',
      });
    }
  }

  @Post('financeiro')
  async createRelatorioFinanceiro(@Body() data: CreateRelatorioDto) {
    return await this.relatorioFinanceiroService.RelatorioFinanceiro(data);
  }

  @Get()
  findAll() {
    return this.relatorioFinanceiroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.relatorioFinanceiroService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRelatorioFinanceiroDto: UpdateRelatorioFinanceiroDto,
  ) {
    return this.relatorioFinanceiroService.update(
      +id,
      updateRelatorioFinanceiroDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.relatorioFinanceiroService.remove(+id);
  }
}
