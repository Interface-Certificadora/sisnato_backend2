import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PixService } from './pix.service';
import { CreatePixDto } from './dto/create-pix.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorPixType } from './entities/erro.pix.entity';
import { Pix } from './entities/pix.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { ConfigWebhookDto } from './dto/config-webhook.dto';

@Controller('pix')
export class PixController {
  constructor(private readonly pixService: PixService) {}

  @Post()
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
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

  @Get('verifique/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
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
