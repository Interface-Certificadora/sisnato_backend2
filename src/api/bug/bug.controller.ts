import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BugService } from './bug.service';
import { CreateBugDto } from './dto/create-bug.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Bug } from './entities/bug.entity';
import { ErrorEntity } from 'src/entities/error.entity';
import { MessageResponseDto } from '../alert/dto/message-response.dto';

@Controller('bug')
export class BugController {
  constructor(private readonly bugService: BugService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cria uma mensagem de bug',
    description: 'Cria uma mensagem de bug',
  })
  @ApiBody({
    type: CreateBugDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Bug criado com sucesso',
    type: Bug,
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    type: ErrorEntity,
  })
  create(@Body() createBugDto: CreateBugDto) {
    return this.bugService.create(createBugDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todas as mensagens de bug',
    description: 'Lista todas as mensagens de bug',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista todas as mensagens de bug',
    type: [Bug],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao requisitar mensagens de bug',
    type: ErrorEntity,
  })
  findAll() {
    return this.bugService.findAll();
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta uma mensagem de bug',
    description: 'Deleta uma mensagem de bug',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensagem de bug deletada com sucesso',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao deletar mensagem de bug',
    type: ErrorEntity,
  })
  remove(@Param('id') id: string) {
    return this.bugService.remove(+id);
  }
}
