import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SystemMessageService } from './system_message.service';
import { CreateSystemMessageDto } from './dto/create-system_message.dto';
import { UpdateSystemMessageDto } from './dto/update-system_message.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SystemMessage } from './entities/system_message.entity';
import { MessageResponseDto } from '../alert/dto/message-response.dto';

@Controller('system-message')
@ApiTags('Mensagens do sistema')
export class SystemMessageController {
  constructor(private readonly systemMessageService: SystemMessageService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo alerta' })
  @ApiResponse({ status: 201, description: 'Alerta criado com sucesso', type: SystemMessage })
  @ApiBody({ type: CreateSystemMessageDto })
  create(@Body() createSystemMessageDto: CreateSystemMessageDto) {
    return this.systemMessageService.create(createSystemMessageDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista todos os alertas' })
  @ApiResponse({ status: 200, description: 'Alertas listados com sucesso', type: [SystemMessage] })
  findAll() {
    return this.systemMessageService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista um alerta' })
  @ApiResponse({ status: 200, description: 'Alerta listado com sucesso', type: SystemMessage })
  findOne(@Param('id') id: string) {
    return this.systemMessageService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um alerta' })
  @ApiResponse({ status: 200, description: 'Alerta atualizado com sucesso', type: SystemMessage })
  update(
    @Param('id') id: string,
    @Body() updateSystemMessageDto: UpdateSystemMessageDto,
  ) {
    return this.systemMessageService.update(+id, updateSystemMessageDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exclui um alerta' })
  @ApiResponse({ status: 200, description: 'Alerta excluido com sucesso', type: MessageResponseDto })
  remove(@Param('id') id: string) {
    return this.systemMessageService.remove(+id);
  }
}
