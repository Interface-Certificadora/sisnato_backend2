import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpreendimentoService } from './empreendimento.service';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';

@Controller('empreendimento')
export class EmpreendimentoController {
  constructor(private readonly empreendimentoService: EmpreendimentoService) {}

  @Post()
  create(@Body() createEmpreendimentoDto: CreateEmpreendimentoDto) {
    return this.empreendimentoService.create(createEmpreendimentoDto);
  }

  @Get()
  findAll() {
    return this.empreendimentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empreendimentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpreendimentoDto: UpdateEmpreendimentoDto) {
    return this.empreendimentoService.update(+id, updateEmpreendimentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empreendimentoService.remove(+id);
  }
}
