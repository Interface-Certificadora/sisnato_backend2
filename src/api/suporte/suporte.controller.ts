import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SuporteService } from './suporte.service';
import { CreateSuporteDto } from './dto/create-suporte.dto';
import { UpdateSuporteDto } from './dto/update-suporte.dto';

@Controller('suporte')
export class SuporteController {
  constructor(private readonly suporteService: SuporteService) {}

  @Post()
  create(@Body() createSuporteDto: CreateSuporteDto) {
    return this.suporteService.create(createSuporteDto);
  }

  @Get()
  findAll() {
    return this.suporteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suporteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSuporteDto: UpdateSuporteDto) {
    return this.suporteService.update(+id, updateSuporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suporteService.remove(+id);
  }
}
