import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PixService } from './pix.service';
import { CreatePixDto } from './dto/create-pix.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorPixType } from './entities/erro.pix.entity';
import { Pix } from './entities/pix.entity';
import { ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConfigWebhookDto } from './dto/config-webhook.dto';
import { FindAllPixQueryDto } from './dto/find-all-pix-query.dto';

@Controller('pix')
export class PixController {
  constructor(private readonly pixService: PixService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo pix',
    description: 'Cria um novo pix',
  })
  @ApiBody({
    type: CreatePixDto,
  })
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

  @Get()
  @ApiOperation({
    summary: 'Lista todos os pix',
    description: 'Lista todos os pix',
  })
  @ApiQuery({ type: FindAllPixQueryDto, style: 'deepObject' })
  @ApiResponse({
    status: 201,
    description: 'Os pix foram listados com sucesso',
    type: Pix,
  })
  @ApiResponse({
    status: 400,
    description: 'Os pix não foram listados',
    type: ErrorPixType,
  })
  findAll(@Query() query: FindAllPixQueryDto) {
    return this.pixService.findAll(query);
  }

  @Get('verifique/:id')
  @ApiOperation({
    summary: 'Verifica um pix',
    description: 'Verifica um pix',
  })
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

  @Post('config-webhook')
  @ApiOperation({
    summary: 'Configura um webhook',
    description: 'Configura um webhook',
  })
  @ApiBody({
    type: ConfigWebhookDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'O webhook foi configurado com sucesso',
    type: Pix,
  })
  @ApiResponse({
    status: 400,
    description: 'O webhook não foi configurado',
    type: ErrorPixType,
  })
  configWebhook(@Body() body: ConfigWebhookDto) {
    return this.pixService.webhookCreate(body.webhookUrl);
  }
}
