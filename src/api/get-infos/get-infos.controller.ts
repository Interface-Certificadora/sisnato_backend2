import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { GetCorretorDto } from './dto/getCorretor.dto';

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
  async checkCpf(@Param('cpf') cpf: string, @Req() req: any) {
    return await this.getInfosService.checkCpf(cpf, req.user);
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

  @Get('options-user')
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
  async getOptionsUser(@Req() req: any) {
    return await this.getInfosService.getOptionsUser(req.user);
  }

  @Post('get-corretores')
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
  async getCorretor(@Body() data: GetCorretorDto) {
    return await this.getInfosService.getCorretores(data);
  }
}
