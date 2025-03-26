import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChamadoService } from './chamado.service';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';

@Controller('chamado')
export class ChamadoController {
  constructor(private readonly chamadoService: ChamadoService) {}

  @Post()
  create(@Body() createChamadoDto: CreateChamadoDto) {
    return this.chamadoService.create(createChamadoDto);
  }

  @Get()
  findAll() {
    return this.chamadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chamadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChamadoDto: UpdateChamadoDto) {
    return this.chamadoService.update(+id, updateChamadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chamadoService.remove(+id);
  }
}
