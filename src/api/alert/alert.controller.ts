import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AuthGuard } from '../../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorUserEntity } from '../user/entities/user.error.entity';
import { AlertEntity } from './entities/alert.entity';
import { CountResponseDto } from './dto/count-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar alerta',
    description: 'Criar alerta',
  })
  @ApiBody({
    description: 'Dados para criar um alerta',
    required: true,
    schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Título do alerta',
          example: 'Título da alerta',
        },
        texto: {
          type: 'string',
          description: 'Descrição do alerta',
          example: 'Descrição da alerta',
        },
        solicitacao_id: {
          type: 'number',
          description: 'ID da solicitação',
          example: 1,
        },
        corretor: { type: 'number', description: 'ID do corretor', example: 1 },
        tipo: {
          type: 'string',
          description: 'Tipo do alerta',
          example: 'CORRETOR',
        },
        tag: { type: 'string', description: 'Tag do alerta', example: 'tag' },
        empreendimento: {
          type: 'number',
          description: 'ID do empreendimento',
          example: 1,
        },
        status: {
          type: 'boolean',
          description: 'Status do alerta',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Criar alerta',
    type: AlertEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async create(@Body() data: any, @Req() req: any) {

    return await this.alertService.create(data, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'trazer todos os alertas',
    description: 'trazer todos os alertas',
  })
  @ApiResponse({
    status: 200,
    description: 'traz todos alertas',
    type: [AlertEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async findAll(@Req() req: any) {
    return await this.alertService.findAll(req.user);
  }

  @Get('get/geral')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'trazer alertas gerais',
    description: 'trazer alertas gerais',
  })
  @ApiResponse({
    status: 200,
    description: 'trazer alertas gerais',
    type: [AlertEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async GetAllGeral() {
    return await this.alertService.GetAllGeral();
  }

  @Get('cont')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'trazer o total de alertas em aberto',
    description: 'trazer o total de alertas em aberto para o usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'traz o total de alertas em aberto',
    type: CountResponseDto, // Alterado de Number para CountResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async count(@Req() req: any): Promise<CountResponseDto> { // Ajustar o tipo de retorno
    const alertCount = await this.alertService.count(req.user);
    return { count: alertCount }; // Retornar o objeto DTO
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do alerta',
    example: 1,
  })
  @ApiOperation({
    summary: 'trazer alertas do id do Operador',
    description: 'trazer alertas do id do Operador',
  })
  @ApiResponse({
    status: 200,
    description: 'trazer alertas do id do Operador',
    type: [AlertEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.alertService.findOne(+id, req.user);
  }

  @Get('get/cadastro/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID da solicitação',
    example: 1,
  })
  @ApiOperation({
    summary: 'trazer alertas do id da solicitação',
    description: 'trazer alertas do id da solicitação',
  })
  @ApiResponse({
    status: 200,
    description: 'trazer alertas do id da solicitação',
    type: [AlertEntity],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async GetAllUserCadastro(@Param('id') id: string, @Req() req: any) {
    return await this.alertService.GetSolicitacaoAlerta(req.user, +id);
  }

  @Put('update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'atualizar solicitação',
    description: 'atualizar solicitação',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID da solicitação',
    example: 1,
  })
  @ApiBody({
    description: 'Dados para atualizar um alerta',
    required: true,
    schema: {
      type: 'object',
      properties: {
        titulo: {
          type: 'string',
          description: 'Título do alerta',
          example: 'Título da alerta',
        },
        texto: {
          type: 'string',
          description: 'Descrição do alerta',
          example: 'Descrição da alerta',
        },
        solicitacao_id: {
          type: 'number',
          description: 'ID da solicitação',
          example: 1,
        },
        corretor: { type: 'number', description: 'ID do corretor', example: 1 },
        tipo: {
          type: 'string',
          description: 'Tipo do alerta',
          example: 'CORRETOR',
        },
        tag: { type: 'string', description: 'Tag do alerta', example: 'tag' },
        empreendimento: {
          type: 'number',
          description: 'ID do empreendimento',
          example: 1,
        },
        status: {
          type: 'boolean',
          description: 'Status do alerta',
          example: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'atualizar solicitação',
    type: AlertEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateAlertDto,
    @Req() req: any,
  ) {
    return await this.alertService.update(+id, data, req.user);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do alerta',
    example: 1,
  })
  @ApiOperation({
    summary: 'Desabilitar alerta',
    description: 'Desabilitar alerta',
  })
  @ApiResponse({
    status: 200,
    description: 'Desabilitar alerta',
    type: MessageResponseDto, 
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async remove(@Param('id') id: string, @Req() req: any): Promise<MessageResponseDto> { 
    const resultMessage = await this.alertService.remove(+id, req.user);
    return resultMessage; 
  }
}
