import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiretoService } from './direto.service';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';

@Controller('direto')
export class DiretoController {
  constructor(private readonly diretoService: DiretoService) {}

  @Post()
  create(@Body() createDiretoDto: CreateDiretoDto) {
    return this.diretoService.create(createDiretoDto);
  }

  @Get()
  findAll() {
    return this.diretoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diretoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDiretoDto: UpdateDiretoDto) {
    return this.diretoService.update(+id, updateDiretoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diretoService.remove(+id);
  }
}
