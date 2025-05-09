import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BugService } from './bug.service';
import { CreateBugDto } from './dto/create-bug.dto';
import { UpdateBugDto } from './dto/update-bug.dto';

@Controller('bug')
export class BugController {
  constructor(private readonly bugService: BugService) {}

  @Post()
  create(@Body() createBugDto: CreateBugDto) {
    return this.bugService.create(createBugDto);
  }

  @Get()
  findAll() {
    return this.bugService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bugService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBugDto: UpdateBugDto) {
    return this.bugService.update(+id, updateBugDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bugService.remove(+id);
  }
}
