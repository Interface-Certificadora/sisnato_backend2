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
} from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto';
import { SMS } from 'aws-sdk';

@Controller('solicitacao')
export class SolicitacaoController {
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Post()
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
      SMS,
      req.user,
    );
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
  async findOne(@Param('id') id: number, @Req() req: any) {
    return await this.solicitacaoService.findOne(+id, req.user);
  }

  @Get('/resend/:id')
  async Resend(@Param('id') id: number) {
    return this.solicitacaoService.resendSms(+id);
  }

  @Put('/update/:id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateSolicitacaoDto,
    @Req() req: any,
  ) {
    return this.solicitacaoService.update(+id, data, req.user);
  }

  @Put('/reativar/:id')
  async Reativar(@Param('id') id: number, @Req() req: any) {
    return await this.solicitacaoService.updateAtivo(+id, req.user);
  }


  @Put('/atendimento/:id')
  async Atendimento(@Param('id')id : number, @Req() req: any) {
      return await this.solicitacaoService.Atendimento(+id, req.user)
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.solicitacaoService.remove(+id, req.user);
  }

  @Post('/posttags')
  async PostTags(@Body() data: any, @Req() req: any) {
    return this.solicitacaoService.PostTags(data, req.user);
  }

  @Put('/pause/:id')
  async pause(@Body() body: any, @Param('id') id: number, @Req() req: any) {
    return this.solicitacaoService.pause(body, +id, req.user);
  }
}
