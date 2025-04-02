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
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AuthGuard } from '../../auth/auth.guard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ErrorUserEntity } from '../user/entities/user.error.entity';
import { AlertEntity } from './entities/alert.entity';

@Controller('alert')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  async create(@Body() data: CreateAlertDto, @Req() req: any) {
    return await this.alertService.create(data, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'traz toso alertas',
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

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  async findOne(@Param('id') id: string) {
    return await this.alertService.findOne(+id);
  }

  @Get('get/cadastro/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  @ApiResponse({
    status: 200,
    description: 'Desabilitar alerta',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro',
    type: ErrorUserEntity,
  })
  async remove(@Param('id') id: string, @Req() req: any,) {
    return await this.alertService.remove(+id, req.user);
  }
}
