import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { ErrorEntity } from '../../entities/error.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { SolicitacaoService } from './solicitacao.service';
import { SolicitacaoEntity } from './entities/solicitacao.entity';
import { SolicitacaoAllEntity } from './entities/solicitacao.propety.entity';
import { UpdateFcwebDto } from './dto/update-fcweb.dto';
import { Logs } from './entities/logs.entity';

@Controller('solicitacao')
export class SolicitacaoController {
  updateAtivo(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'SMS',
    required: false,
    type: String,
    description: 'Envia SMS para a Solicitação.',
    example: '1 ou 0',
    default: '1 = enviar SMS para cleinte',
  })
  @ApiOperation({
    summary: 'Cria uma nova Solicitação.',
    description:
      'Rota para criar uma nova Solicitação, feita pelo Corretor ou CCA.',
  })
  @ApiResponse({
    status: 201,
    description: 'Solicitação criada com sucesso.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar Solicitação.',
    type: ErrorEntity,
  })
  async create(
    @Body() data: CreateSolicitacaoDto,
    @Req() req: any,
    @Query() query: any,
  ) {
    const { SMS } = query;
    const PostSolicitacao = await this.solicitacaoService.create(
      {
        ...data,
        corretor: data.corretor ? data.corretor : req.user.id,
      },
      +SMS || 1,
      req.user,
    );
    return PostSolicitacao;
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todas as Solicitações.',
    description:
      'Rota para buscar todas as Solicitações da plataforma com paginação e filtros.',
  })
  @ApiOkResponse({
    description: 'Busca todas as Solicitações.',
    type: SolicitacaoAllEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar Solicitações.',
    type: ErrorEntity,
  })
  async findAll(@Req() req: any, @Query() query: QuerySolicitacaoDto) {
    const filter = {
      ...(query.nome && { nome: query.nome }),
      ...(query.andamento && { andamento: query.andamento }),
      ...(query.construtora && { construtora: +query.construtora }),
      ...(query.empreendimento && {
        empreendimento: +query.empreendimento,
      }),
      ...(query.financeiro && { financeiro: +query.financeiro }),
      ...(query.id && { id: +query.id }),
    };

    console.log("🚀 ~ SolicitacaoController ~ findAll ~ +query.pagina:", +query.pagina)
    const result = await this.solicitacaoService.findAll(
      +query.pagina,
      +query.limite,
      filter,
      req.user,
    );
    return result;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca uma Solicitação pelo Id.',
    description:
      'Rota para buscar uma Solicitação pelo Id, trazendo todas as informações relacionadas.',
  })
  @ApiOkResponse({
    description: 'Busca uma Solicitação pelo Id.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar Solicitação.',
    type: ErrorEntity,
  })
  async findOne(@Param('id') id: number, @Req() req: any) {
    return await this.solicitacaoService.findOne(+id, req.user);
  }

  @Get('/send/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reenvia SMS.',
    description:
      'Rota para Enviar Uma Mensagem Edital Para O Cliente .',
  })
  @ApiOkResponse({
    description: 'Reenvia Mensagem para a Solicitação.',
    type: ErrorEntity,
    example: { message: 'Mensagem Enviada com Sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao Enviar Mensagem.',
    example: { message: 'Erro ao Enviar Mensagem.' },
    type: ErrorEntity,
  })
  async Send(@Param('id') id: number, @Req() req: any) {
    return this.solicitacaoService.sendSms(+id, req.user);
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza uma Solicitação.',
    description: 'Rota para atualizar os dados de uma Solicitação.',
  })
  @ApiOkResponse({
    description: 'Atualiza uma Solicitação.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar Solicitação.',
    type: ErrorEntity,
  })
  updateSisapp(
    @Param('id') id: string,
    @Body() data: UpdateSolicitacaoDto,
    @Req() req: any,
  ) {
    return this.solicitacaoService.update(+id, data, req.user);
  }

  @Put('/limpar/fcweb/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Limpa o FCWEB.',
    description: 'Rota para limpar os dados do FCWEB.',
  })
  @ApiOkResponse({
    description: 'Atualiza uma Solicitação.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar Solicitação.',
    type: ErrorEntity,
  })
  updateFcweb(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.solicitacaoService.LimparFcweb(+id, data, req.user);
  }

  @Put('/sisapp/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza uma Solicitação.',
    description: 'Rota para atualizar os dados de uma Solicitação.',
  })
  @ApiOkResponse({
    description: 'Atualiza uma Solicitação.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao atualizar Solicitação.',
    type: ErrorEntity,
  })
  update(
    @Param('id') id: string,
    @Body() data: UpdateSolicitacaoDto,
    @Req() req: any,
  ) {
    return this.solicitacaoService.updateSisapp(+id, data, req.user);
  }

  @Put('/reativar/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reativa uma Solicitação.',
    description:
      'Rota para reativar uma Solicitação, que foram desativadas pelo CCa ou Corretor.',
  })
  @ApiOkResponse({
    description: 'Reativa uma Solicitação.',
    example: { message: 'Solicitação reativada com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao reativar Solicitação.',
    type: ErrorEntity,
    example: { message: 'Erro ao reativar Solicitação.' },
  })
  async Reativar(@Param('id') id: number, @Req() req: any) {
    return await this.solicitacaoService.updateAtivo(+id, req.user);
  }

  @Put('/atendimento/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Status do Atendimento.',
    description:
      'Rota para alterar o status do atendimento de uma Solicitação.',
  })
  @ApiOkResponse({
    description: 'Status do Atendimento.',
    type: Boolean,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao alterar o status do atendimento.',
    type: ErrorEntity,
  })
  async Atendimento(@Param('id') id: number, @Req() req: any) {
    return await this.solicitacaoService.Atendimento(+id, req.user);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta uma Solicitação.',
    description: 'Rota para deletar uma Solicitação.',
  })
  @ApiOkResponse({
    description: 'Deleta uma Solicitação.',
    example: { message: 'Solicitação deletada com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao deletar Solicitação.',
    type: ErrorEntity,
    example: { message: 'Erro ao deletar Solicitação.' },
  })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.solicitacaoService.remove(+id, req.user);
  }

  @Put('/distrato/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Distrato uma Solicitação.',
    description: 'Rota para distrato uma Solicitação.',
  })
  @ApiOkResponse({
    description: 'Distrato uma Solicitação.',
    type: SolicitacaoEntity,
    example: { message: 'Distrato realizado com sucesso' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao distrato Solicitação.',
    type: ErrorEntity,
    example: { message: 'Erro ao distrato Solicitação.' },
  })
  distrato(@Param('id') id: string, @Req() req: any) {
    return this.solicitacaoService.distrato(+id, req.user);
  }

  @Put('/novo_acordo/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Novo Acordo.',
    description: 'Rota para novo acordo.',
  })
  @ApiOkResponse({
    description: 'Novo acordo.',
    type: SolicitacaoEntity,
    example: { message: 'Novo acordo realizado com sucesso' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao novo acordo.',
    type: ErrorEntity,
    example: { message: 'Erro ao novo acordo.' },
  })
  novo_acordo(@Param('id') id: string, @Req() req: any) {
    return this.solicitacaoService.novo_acordo(+id, req.user);
  }

  @Post('/post/tags')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Adicionar Tags',
    description: 'Rota para adicionar tags a uma Solicitação.',
  })
  @ApiOkResponse({
    type: SolicitacaoEntity,
    description: 'Adiciona tags a uma Solicitação.',
    example: { message: 'Tag adicionada com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar Solicitação.',
    type: ErrorEntity,
  })
  async PostTags(@Body() data: any, @Req() req: any) {
    return this.solicitacaoService.PostTags(data, req.user);
  }

  @Put('/pause/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Pausar uma Solicitação.',
    description: 'Rota para pausar uma Solicitação.',
  })
  @ApiOkResponse({
    description:
      'Retorna a solicitação atualizada com o status de pausa modificado.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao pausar Solicitação.',
    type: ErrorEntity,
    example: { message: 'Erro ao pausar Solicitação.' },
  })
  async pause(@Body() body: any, @Param('id') id: number, @Req() req: any) {
    return this.solicitacaoService.pause(body, +id, req.user);
  }

  @Put('/fcweb/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca dados do Fcweb pelo Id.',
    description: 'Rota para buscar dados do sistema Fcweb pelo Id do registro.',
  })
  @ApiOkResponse({
    description: 'Dados do Fcweb encontrados com sucesso.',
    type: SolicitacaoEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar dados do Fcweb.',
    type: ErrorEntity,
  })
  async getFcweb(
    @Param('id') id: number,
    @Req() req: any,
    @Body() body: UpdateFcwebDto,
  ) {
    return await this.solicitacaoService.GetFcwebAtt(+id, body, req.user);
  }

  @Get('list/now/cont')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'contar solicitação com Now.',
    description: 'contar solicitação com Now.',
  })
  @ApiOkResponse({
    description: 'contar solicitação com Now.',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao contar solicitação com Now.',
    type: ErrorEntity,
  })
  async listNowConst() {
    return await this.solicitacaoService.listNowConst();
  }

  @Get('list/now/get')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca lista de Solicitações Urgentes.',
    description: 'Rota para buscar lista de Solicitações Urgentes.',
  })
  @ApiOkResponse({
    description: 'Lista de Solicitações encontrada com sucesso.',
    type: SolicitacaoAllEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar lista de Solicitações Urgentes.',
    type: ErrorEntity,
  })
  async listNowGet() {
    return await this.solicitacaoService.listNowGet();
  }

  @Patch('/chat/:id')
  @ApiOperation({
    summary: 'rota feita para chat',
    description: 'rota para o chat',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 400,
    description: 'Erro ao subir Chat  .',
    type: ErrorEntity,
  })
  @ApiResponse({
    status: 200,
    description: 'Chat subido com sucesso.',
    type: SolicitacaoEntity,
  })
  async chat(@Body() body: any, @Param('id') id: number, @Req() req: any) {
    return this.solicitacaoService.chat(body, +id, req.user);
  }

  @Get('/getlogs/:id')
  @ApiOperation({
    summary: 'rota feita para buscar os logs',
    description: 'rota para buscar os logs',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar logs .',
    type: ErrorEntity,
  })
  @ApiResponse({
    status: 200,
    description: 'Logs encontrados com sucesso.',
    type: Logs,
  })
  async getLogs(@Param('id') id: number, @Req() req: any) {
    return this.solicitacaoService.getLogs(+id, req.user);
  }
}
