import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiretoTagsService } from './direto-tags.service';
import { CreateDiretoTagDto } from './dto/create-direto-tag.dto';
import { UpdateDiretoTagDto } from './dto/update-direto-tag.dto';

@Controller('direto-tags')
export class DiretoTagsController {
  constructor(private readonly diretoTagsService: DiretoTagsService) {}

  @Post()
  create(@Body() createDiretoTagDto: CreateDiretoTagDto) {
    return this.diretoTagsService.create(createDiretoTagDto);
  }

  @Get()
  findAll() {
    return this.diretoTagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diretoTagsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiretoTagDto: UpdateDiretoTagDto,
  ) {
    return this.diretoTagsService.update(+id, updateDiretoTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diretoTagsService.remove(+id);
  }
}
