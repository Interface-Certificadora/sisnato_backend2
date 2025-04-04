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
import { ApiResponse } from '@nestjs/swagger';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';

@Controller('get-infos')
export class GetInfosController {
  constructor(private readonly getInfosService: GetInfosService) {}

  @Get('/checkcpf/:cpf')
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
  @ApiResponse({
    status: 200,
    description: 'Retorna os termos de uso',
    type: String,
  })
  async getTermos() {
    return await this.getInfosService.getTermos();
  }
}
