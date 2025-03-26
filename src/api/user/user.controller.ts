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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ErrorUserEntity } from './entities/user.error.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao criar usuário',
    type: ErrorUserEntity,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de Usuarios encontrada com sucesso',
    type: [User],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuarios nao encontrados',
    type: ErrorUserEntity,
  })
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/get/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário nao encontrado',
    type: ErrorUserEntity,
  })
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @Get('/construtora/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Construtora encontrado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Construtora nao encontrado',
    type: ErrorUserEntity,
  })
  async getUsersByConstrutora(@Param('id') construtora: string) {
    return await this.userService.getUsersByConstrutora(construtora);
  }

  @Patch('/update/password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao alterar senha',
    type: ErrorUserEntity,
  })
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.userService.updatePassword(+id, data.password);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
