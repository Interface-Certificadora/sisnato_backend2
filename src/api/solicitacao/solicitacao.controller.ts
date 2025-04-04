import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SolicitacaoEntity } from './entities/solicitacao.entity';
import { ErrorEntity } from '../../entities/error.entity';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('solicitacao')
export class SolicitacaoController {
  updateAtivo(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly solicitacaoService: SolicitacaoService) { }

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
  create(
    @Body() data: CreateSolicitacaoDto,
    @Req() req: any,
    @Query() query: any,
  ) {
    const { SMS } = query;
    return this.solicitacaoService.create(
      {
        ...data,
        corretor: data.corretor ? data.corretor : req.user.id,
      },
      +SMS || 1,
      req.user,
    );
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
    type: SolicitacaoEntity,
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

  @Get('/resend/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reenvia SMS.',
    description:
      'Rota para reenviar SMS para o cliente, em caso de erro ou não recebimento.',
  })
  @ApiOkResponse({
    description: 'Reenvia SMS para a Solicitação.',
    type: ErrorEntity,
    example: { message: 'SMS reenviado com sucesso.' },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao reenviar SMS.',
    example: { message: 'Erro ao reenviar SMS.' },
    type: ErrorEntity,
  })
  async Resend(@Param('id') id: number, @Req() req: any) {
    return this.solicitacaoService.resendSms(+id, req.user);
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
  update(
    @Param('id') id: string,
    @Body() data: UpdateSolicitacaoDto,
    @Req() req: any,
  ) {
    return this.solicitacaoService.update(+id, data, req.user);
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
    description: 'Pausar uma Solicitação.',
    example: { message: 'Solicitação pausada com sucesso.' },
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
}
