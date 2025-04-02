import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ErrorUserEntity } from './entities/user.error.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { QueryUserDto } from './dto/query.dto';

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

  @Patch('/update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Usuário alterado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao alterar usuário',
    type: ErrorUserEntity,
  })
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.userService.update(+id, data);
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
  async updatepassword(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.userService.updatePassword(+id, data.password);
  }

  @Patch('/reset_password/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
  async resetPassword(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    return await this.userService.primeAcess(+id, updateUserDto);
  }

  @Delete('/suspense/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Usuário suspendido com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao suspender usuário',
    type: ErrorUserEntity,
  })
  async suspense(@Param('id') id: string) {
    const data : UpdateUserDto = { status: false };
    return await this.userService.update(+id, data);
  }

  @Delete('/delete/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao remover usuário',
    type: ErrorUserEntity,
  })
  async remove(@Param('id') id: number) {
    return await this.userService.remove(id);
  }

  @Get('/Busca/')
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
  async Busca(@Query('') query: QueryUserDto) {
    return await this.userService.search(query);
  }

  @Get('/termos/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Termo encontrado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Termo nao encontrado',
    type: ErrorUserEntity,
  })
  async userTermos(@Param('id') id: string) {
    return await this.userService.userTermos(+id);
  }

  @Patch('/aceitar/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Termo alterado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Termo nao encontrado',
    type: ErrorUserEntity,
  })
  async updateTermos(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return await this.userService.updateTermo(+id, data);
  }

}
