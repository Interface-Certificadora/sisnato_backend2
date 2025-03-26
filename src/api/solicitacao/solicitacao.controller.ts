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
} from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto';

@Controller('solicitacao')
export class SolicitacaoController {
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Post()
  create(@Body() createSolicitacaoDto: CreateSolicitacaoDto) {
    return this.solicitacaoService.create(createSolicitacaoDto);
  }

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.solicitacaoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSolicitacaoDto: UpdateSolicitacaoDto,
  ) {
    return this.solicitacaoService.update(+id, updateSolicitacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitacaoService.remove(+id);
  }
}
