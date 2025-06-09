import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { GetInfosService } from './get-infos.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { GetInfoErrorEntity } from './entities/get-info.error.entity';
import { GetInfoSolicitacaoEntity } from './entities/get-info-solicitacao-entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('get-infos')
export class GetInfosController {
  constructor(private readonly getInfosService: GetInfosService) {}

  @Get('/checkcpf/:cpf')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
    type: [GetInfoSolicitacaoEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro na requisição',
    type: GetInfoErrorEntity,
  })
  async checkCpf(@Param('cpf') cpf: string) {
    console.log('🚀 ~ GetInfosController ~ checkCpf ~ cpf:', cpf);
    return await this.getInfosService.checkCpf(cpf);
  }

  @Get('termos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retorna os termos de uso',
    description: 'Retorna os termos de uso',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna os termos de uso',
    type: String,
  })
  async getTermos(@Res({ passthrough: true }) resp: Response): Promise<void> {
    const html: any = await this.getInfosService.getTermos();
    return html;
  }

  // @Get('termos')
  // @ApiOperation({
  //   summary: 'Políticas de uso',
  //   description: 'Retorna as políticas de uso',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Retorna as políticas de uso',
  //   type: String,
  // })
  // async getPoliticas() {
  //   return await this.getInfosService.getTermos();
  // }

  @Get('options-admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Retorna as opções de admin de emprendimento, contrutora, corretor, financeira',
    description:
      'Retorna as opções de admin de emprendimento, contrutora, corretor, financeira',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna as opções de admin',
    type: Object,
  })
  async getOptionsAdmin() {
    return await this.getInfosService.getOptionsAdmin();
  }
}
