import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NowService } from './now.service';
import { CreateNowDto } from './dto/create-now.dto';
import { UpdateNowDto } from './dto/update-now.dto';

@Controller('now')
export class NowController {
  constructor(private readonly nowService: NowService) {}

  @Post()
  create(@Body() createNowDto: CreateNowDto) {
    return this.nowService.create(createNowDto);
  }

  @Get()
  findAll() {
    return this.nowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nowService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNowDto: UpdateNowDto) {
    return this.nowService.update(+id, updateNowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nowService.remove(+id);
  }
}
