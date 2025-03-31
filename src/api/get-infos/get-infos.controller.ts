import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GetInfosService } from './get-infos.service';
import { CreateGetInfoDto } from './dto/create-get-info.dto';
import { UpdateGetInfoDto } from './dto/update-get-info.dto';

@Controller('get-infos')
export class GetInfosController {
  constructor(private readonly getInfosService: GetInfosService) {}

  @Post()
  create(@Body() createGetInfoDto: CreateGetInfoDto) {
    return this.getInfosService.create(createGetInfoDto);
  }

  @Get()
  findAll() {
    return this.getInfosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getInfosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGetInfoDto: UpdateGetInfoDto) {
    return this.getInfosService.update(+id, updateGetInfoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.getInfosService.remove(+id);
  }
}
