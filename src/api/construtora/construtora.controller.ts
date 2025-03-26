import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConstrutoraService } from './construtora.service';
import { CreateConstrutoraDto } from './dto/create-construtora.dto';
import { UpdateConstrutoraDto } from './dto/update-construtora.dto';

@Controller('construtora')
export class ConstrutoraController {
  constructor(private readonly construtoraService: ConstrutoraService) {}

  @Post()
  create(@Body() createConstrutoraDto: CreateConstrutoraDto) {
    return this.construtoraService.create(createConstrutoraDto);
  }

  @Get()
  findAll() {
    return this.construtoraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.construtoraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConstrutoraDto: UpdateConstrutoraDto) {
    return this.construtoraService.update(+id, updateConstrutoraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.construtoraService.remove(+id);
  }
}
