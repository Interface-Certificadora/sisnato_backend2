import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChecktelService } from './checktel.service';
import { CreateChecktelDto } from './dto/create-checktel.dto';
import { UpdateChecktelDto } from './dto/update-checktel.dto';

@Controller('checktel')
export class ChecktelController {
  constructor(private readonly checktelService: ChecktelService) {}

  @Post()
  create(@Body() createChecktelDto: CreateChecktelDto) {
    return this.checktelService.create(createChecktelDto);
  }

  @Get()
  findAll() {
    return this.checktelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checktelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChecktelDto: UpdateChecktelDto) {
    return this.checktelService.update(+id, updateChecktelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checktelService.remove(+id);
  }
}
