import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { SuporteService } from './suporte.service';
import { CreateSuporteDto } from './dto/create-suporte.dto';
import { UpdateSuporteDto } from './dto/update-suporte.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileSuporteDto } from './dto/create-file-suporte.dto';
import { S3Service } from 'src/s3/s3.service';

@Controller('suporte')
export class SuporteController {
  constructor(
    private readonly suporteService: SuporteService,
    private readonly S3: S3Service
  ) {}

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

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async createFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateFileSuporteDto,
  ) {
    console.log(file);
    return await this.S3.uploadFile('interface-whasapp', file.originalname, file.mimetype, file.buffer);
    // return this.fileService.create(createFileDto);
  }

  @Get('file/:id')
  findOneFile(@Param('id') id: string) {
    // return this.fileService.findOne(+id);
  }

  @Delete('file/:id')
  removeFile(@Param('id') id: string) {
    // return this.fileService.remove(+id);
  }
}
