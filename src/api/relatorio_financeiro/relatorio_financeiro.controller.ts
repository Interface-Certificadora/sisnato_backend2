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
  UseGuards,
} from '@nestjs/common';
import { RelatorioFinanceiroService } from './relatorio_financeiro.service';
import { CreateRelatorioFinanceiroDto } from './dto/create-relatorio_financeiro.dto';
import { UpdateRelatorioFinanceiroDto } from './dto/update-relatorio_financeiro.dto';
import { Response } from 'express';
import { S3Service } from 'src/s3/s3.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorEntity } from 'src/entities/error.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RelatorioFinanceiro } from './entities/relatorio_financeiro.entity';
import { RelatorioFinanceiroOne } from './entities/relatorio_financeiro_one.entity';
import { CreateRelatorioDto } from './dto/relatorio.tdo';
import { PesquisaRelatorioDto } from './dto/pesquisa-relatorio.dto';
import { RelatorioFinanceiroGeral } from './entities/relatorio_financeiro_geral.entity';

/**
 * Controller responsável pelos endpoints de relatórios financeiros.
 * Segue boas práticas de Clean Code e SOLID.
 */
@Controller('relatorio')
@ApiTags('Relatórios financeiros')
export class RelatorioFinanceiroController {
  constructor(
    private readonly relatorioFinanceiroService: RelatorioFinanceiroService,
    private readonly S3: S3Service,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria um relatório financeiro.',
    description: 'Rota para criar um relatório financeiro.',
  })
  @ApiOkResponse({
    type: CreateRelatorioFinanceiroDto,
    description: 'Relatório financeiro criado com sucesso.',
    example: { message: 'Relatório financeiro criado com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao criar relatório financeiro.' },
  })
  create(@Body() data: CreateRelatorioFinanceiroDto) {
    return this.relatorioFinanceiroService.create(data);
  }

  /**
   * Endpoint para visualizar PDF no navegador.
   * Usa Content-Disposition: inline para abrir o PDF no browser.
   */
  @Get('view/pdf/:protocolo')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Visualiza um relatório financeiro no PDF.',
    description: 'Rota para visualizar um relatório financeiro no PDF.',
  })
  @ApiOkResponse({
    type: Buffer,
    description: 'Relatório financeiro visualizado no PDF.',
    example: { message: 'Relatório financeiro visualizado no PDF.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao visualizar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao visualizar relatório financeiro.' },
  })
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Baixa um relatório financeiro no PDF.',
    description: 'Rota para baixar um relatório financeiro no PDF.',
  })
  @ApiOkResponse({
    type: Buffer,
    description: 'Relatório financeiro baixado no PDF.',
    example: { message: 'Relatório financeiro baixado no PDF.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao baixar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao baixar relatório financeiro.' },
  })
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Visualiza um relatório financeiro no XLSX.',
    description: 'Rota para visualizar um relatório financeiro no XLSX.',
  })
  @ApiOkResponse({
    type: Buffer,
    description: 'Relatório financeiro visualizado no XLSX.',
    example: { message: 'Relatório financeiro visualizado no XLSX.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao visualizar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao visualizar relatório financeiro.' },
  })
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Baixa um relatório financeiro no XLSX.',
    description: 'Rota para baixar um relatório financeiro no XLSX.',
  })
  @ApiOkResponse({
    type: Buffer,
    description: 'Relatório financeiro baixado no XLSX.',
    example: { message: 'Relatório financeiro baixado no XLSX.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao baixar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao baixar relatório financeiro.' },
  })
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

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todos os relatórios financeiros.',
    description: 'Rota para listar todos os relatórios financeiros.',
  })
  @ApiOkResponse({
    type: [RelatorioFinanceiro],
    description: 'Relatórios financeiros listados com sucesso.',
    example: { message: 'Relatórios financeiros listados com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao listar relatórios financeiros.',
    type: ErrorEntity,
    example: { message: 'Erro ao listar relatórios financeiros.' },
  })
  findAll() {
    return this.relatorioFinanceiroService.findAll();
  }

  @Get(':id')
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca um relatório financeiro.',
    description: 'Rota para buscar um relatório financeiro.',
  })
  @ApiOkResponse({
    type: RelatorioFinanceiro,
    description: 'Relatório financeiro buscado com sucesso.',
    example: { message: 'Relatório financeiro buscado com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao buscar relatório financeiro.' },
  })
  findOne(@Param('id') id: string) {
    return this.relatorioFinanceiroService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza um relatório financeiro.',
    description: 'Rota para atualizar um relatório financeiro.',
  })
  @ApiOkResponse({
    type: RelatorioFinanceiroOne,
    description: 'Relatório financeiro atualizado com sucesso.',
    example: { message: 'Relatório financeiro atualizado com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao atualizar relatório financeiro.' },
  })
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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exclui um relatório financeiro.',
    description: 'Rota para excluir um relatório financeiro.',
  })
  @ApiOkResponse({
    description: 'Relatório financeiro excluído com sucesso.',
    example: { message: 'Relatório financeiro excluído com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao excluir relatório financeiro.' },
  })
  remove(@Param('id') id: string) {
    console.log(id);
    return this.relatorioFinanceiroService.remove(+id);
  }

  @Post('pesquisa')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pesquisa um relatório financeiro.',
    description: 'Rota para pesquisar um relatório financeiro.',
  })
  @ApiOkResponse({
    type: PesquisaRelatorioDto,
    description: 'Relatório financeiro pesquisado com sucesso.',
    example: { message: 'Relatório financeiro pesquisado com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao pesquisar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao pesquisar relatório financeiro.' },
  })
  pesquisa(@Body() data: PesquisaRelatorioDto) {
    return this.relatorioFinanceiroService.pesquisa(data);
  }

  @Get('numeros/geral')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gera um relatório financeiro.',
    description: 'Rota para gerar um relatório financeiro.',
  })
  @ApiOkResponse({
    type: RelatorioFinanceiroGeral,
    description: 'Relatório financeiro gerado com sucesso.',
    example: { message: 'Relatório financeiro gerado com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao gerar relatório financeiro.',
    type: ErrorEntity,
    example: { message: 'Erro ao gerar relatório financeiro.' },
  })
  relatorioFinanceiroGeral() {
    return this.relatorioFinanceiroService.relatorioFinanceiroGeral();
  }
}
