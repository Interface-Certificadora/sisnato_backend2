import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';

@Controller('solicitacao')
export class SolicitacaoController {
  constructor(private readonly solicitacaoService: SolicitacaoService) {}

  @Post()
  create(@Body() createSolicitacaoDto: CreateSolicitacaoDto) {
    return this.solicitacaoService.create(createSolicitacaoDto);
  }

  @Get()
  findAll() {
    return this.solicitacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitacaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitacaoDto: UpdateSolicitacaoDto) {
    return this.solicitacaoService.update(+id, updateSolicitacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitacaoService.remove(+id);
  }
}
