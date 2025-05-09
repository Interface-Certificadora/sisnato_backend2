import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PixService } from './pix.service';
import { CreatePixDto } from './dto/create-pix.dto';
import { UpdatePixDto } from './dto/update-pix.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorPixType } from './entities/erro.pix.entity';
import { Pix } from './entities/pix.entity';

@Controller('pix')
export class PixController {
  constructor(private readonly pixService: PixService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'O pix foi criado com sucesso',
    type: Pix,
  })
  @ApiResponse({
    status: 400,
    description: 'O pix não foi criado',
    type: ErrorPixType,
  })
  create(@Body() createPixDto: CreatePixDto) {
    return this.pixService.create(createPixDto);
  }

  @Get('verifique/:id')
  @ApiResponse({
    status: 201,
    description: 'O pix foi criado com sucesso',
    type: Pix,
  })
  @ApiResponse({
    status: 400,
    description: 'O pix não foi criado',
    type: ErrorPixType,
  })
  verifique(@Param('id') id: string) {
    return this.pixService.PixPaymentStatus(id);
  }
}
