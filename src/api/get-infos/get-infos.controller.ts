import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GetInfosService } from './get-infos.service';
import { CreateGetInfoDto } from './dto/create-get-info.dto';
import { UpdateGetInfoDto } from './dto/update-get-info.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';

@Controller('get-infos')
export class GetInfosController {
  constructor(private readonly getInfosService: GetInfosService) {}

  @Get('/checkcpf/:cpf')
  @ApiOperation({
    summary: 'Verifica se o CPF existe no banco',
    description: 'Verifica se o CPF existe no banco',
  })
  @ApiParam({
    name: 'cpf',
    description: 'CPF da Solicitação',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Verifica se o CPF existe no banco',
    type: Boolean,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na requisição',
    type: GetInfoErrorEntity,
  })
  async checkCpf(@Param('cpf') cpf: string) {
    return await this.getInfosService.checkCpf(cpf);
  }

  @Get('/termos/')
  @ApiOperation({
    summary: 'Retorna os termos de uso',
    description: 'Retorna os termos de uso',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os termos de uso',
    type: String,
  })
  async getTermos() {
    return await this.getInfosService.getTermos();
  }
}
