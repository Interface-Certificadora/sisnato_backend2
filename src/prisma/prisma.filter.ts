import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno no servidor';

    switch (exception.code) {
      // Erros de valor e tipo
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Valor fornecido para a coluna é muito longo: ${exception.meta?.column_name}`;
        break;
      case 'P2001':
        statusCode = HttpStatus.NOT_FOUND;
        message = `Registro não encontrado: ${exception.meta?.model_name}.${exception.meta?.argument_name} = ${exception.meta?.argument_value}`;
        break;
      case 'P2002':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Restrição de unicidade violada: ${exception.meta?.constraint}`;
        break;
      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Falha de chave estrangeira no campo: ${exception.meta?.field_name}`;
        break;
      case 'P2004':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Falha em uma restrição do banco de dados: ${exception.meta?.database_error}`;
        break;
      case 'P2005':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Valor inválido no banco de dados para o campo ${exception.meta?.field_name}: ${exception.meta?.field_value}`;
        break;
      case 'P2006':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Valor fornecido inválido para ${exception.meta?.model_name}.${exception.meta?.field_name}: ${exception.meta?.field_value}`;
        break;
      case 'P2007':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Erro de validação de dados: ${exception.meta?.database_error}`;
        break;
      case 'P2008':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Falha ao analisar a query: ${exception.meta?.query_parsing_error} em ${exception.meta?.query_position}`;
        break;
      case 'P2009':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Falha ao validar a query: ${exception.meta?.query_validation_error} em ${exception.meta?.query_position}`;
        break;
      case 'P2010':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Query bruta falhou. Código: ${exception.meta?.code}. Mensagem: ${exception.meta?.message}`;
        break;
      case 'P2011':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Violação de restrição NOT NULL: ${exception.meta?.constraint}`;
        break;
      case 'P2012':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Valor obrigatório ausente em: ${exception.meta?.path}`;
        break;
      case 'P2013':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Argumento obrigatório ausente: ${exception.meta?.argument_name} para o campo ${exception.meta?.field_name} em ${exception.meta?.object_name}`;
        break;
      case 'P2014':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Alteração violaria relação obrigatória '${exception.meta?.relation_name}' entre os modelos ${exception.meta?.model_a_name} e ${exception.meta?.model_b_name}`;
        break;
      case 'P2015':
        statusCode = HttpStatus.NOT_FOUND;
        message = `Registro relacionado não encontrado. Detalhes: ${exception.meta?.details}`;
        break;
      case 'P2016':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Erro de interpretação da query. Detalhes: ${exception.meta?.details}`;
        break;
      case 'P2017':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Registros da relação ${exception.meta?.relation_name} entre ${exception.meta?.parent_name} e ${exception.meta?.child_name} não estão conectados.`;
        break;
      case 'P2018':
        statusCode = HttpStatus.NOT_FOUND;
        message = `Registros conectados obrigatórios não encontrados. Detalhes: ${exception.meta?.details}`;
        break;
      case 'P2019':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Erro de entrada de dados. Detalhes: ${exception.meta?.details}`;
        break;
      case 'P2020':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Valor fora do intervalo permitido para o tipo. Detalhes: ${exception.meta?.details}`;
        break;
      case 'P2021':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Tabela ${exception.meta?.table} não existe no banco de dados atual.`;
        break;
      case 'P2022':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Coluna ${exception.meta?.column} não existe no banco de dados atual.`;
        break;
      case 'P2023':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Dados inconsistentes na coluna: ${exception.meta?.message}`;
        break;
      case 'P2024':
        statusCode = HttpStatus.REQUEST_TIMEOUT;
        message = `Tempo esgotado ao buscar nova conexão no pool. Timeout: ${exception.meta?.timeout}, Limite: ${exception.meta?.connection_limit}`;
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = `Operação falhou por depender de registros obrigatórios não encontrados. Causa: ${exception.meta?.cause}`;
        break;
      case 'P2026':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Recurso não suportado pelo provedor do banco de dados: ${exception.meta?.feature}`;
        break;
      case 'P2027':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Múltiplos erros no banco de dados durante a execução da query: ${exception.meta?.errors}`;
        break;
      case 'P2028':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Erro na API de transação: ${exception.meta?.error}`;
        break;
      case 'P2029':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Limite de parâmetros da query excedido: ${exception.meta?.message}`;
        break;
      case 'P2030':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Índice fulltext não encontrado para busca. Adicione @@fulltext([Fields...]) ao schema.`;
        break;
      case 'P2031':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Transações exigem MongoDB em modo replica set. Veja: https://pris.ly/d/mongodb-replica-set`;
        break;
      case 'P2032':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Erro desconhecido do Prisma (P2032).`;
        break;
      case 'P2033':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Número utilizado na query não cabe em inteiro 64 bits. Considere usar BigInt.`;
        break;
      case 'P2034':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Transação falhou por conflito de escrita ou deadlock. Tente novamente.`;
        break;
      case 'P2035':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Violação de asserção no banco de dados: ${exception.meta?.database_error}`;
        break;
      case 'P2036':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Erro em conector externo (id ${exception.meta?.id})`;
        break;
      case 'P2037':
        statusCode = HttpStatus.BAD_REQUEST;
        message = `Muitas conexões abertas com o banco de dados: ${exception.meta?.message}`;
        break;
      default:
        break;
    }
    response.status(statusCode).json({ message });
  }
}
