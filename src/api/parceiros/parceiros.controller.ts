import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParceirosService } from './parceiros.service';
import { CreateParceiroDto } from './dto/create-parceiro.dto';
import { UpdateParceiroDto } from './dto/update-parceiro.dto';

@Controller('parceiros')
export class ParceirosController {
  constructor(private readonly parceirosService: ParceirosService) {}

  @Post()
  create(@Body() createParceiroDto: CreateParceiroDto) {
    return this.parceirosService.create(createParceiroDto);
  }

  @Get()
  findAll() {
    return this.parceirosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parceirosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParceiroDto: UpdateParceiroDto) {
    return this.parceirosService.update(+id, updateParceiroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parceirosService.remove(+id);
  }
}
