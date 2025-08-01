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
  Req,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ErrorUserEntity } from './entities/user.error.entity';
import { AuthGuard } from '../../auth/auth.guard';
import { QueryUserDto } from './dto/query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um usuário',
  })
  @ApiBody({
    type: CreateUserDto,
  })
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
  @ApiOperation({
    summary: 'Listar usuários',
    description: 'Listar usuários',
  })
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
  async findAll(@Req() req: any) {
    return await this.userService.findAll(req.user);
  }

  @Get('/get/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuário',
    description: 'Busca um usuário',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
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
  @ApiOperation({
    summary: 'Buscar usuário por construtora',
    description: 'Busca um usuário por construtora',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
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
  async getCorretorByConstrutora(@Param('id') construtora: string) {
    return await this.userService.getCorretorByConstrutora(+construtora);
  }

  @Patch('/update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alterar um usuário',
    description: 'Alterar um usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({
    description: 'Dados Para alteração do usuário',
    type: UpdateUserDto,
  })
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

  @Patch('/reset_password/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resetar a senha do usuário',
    description: 'Resetar a senha do usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({
    description: 'Dados Para alteração da senha do usuário',
    examples: {
      value: {
        summary: 'Exemplo',
        value: {
          password: '1234',
        },
      },
    },
  })
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
  async resetPassword(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return await this.userService.primeAcess(+id, updateUserDto, req.user);
  }

  @Delete('/suspense/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Suspender um usuário',
    description: 'Suspender um usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
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
    const data: UpdateUserDto = { status: false };
    return await this.userService.update(+id, data);
  }

  @Delete('/delete/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletar um usuário',
    description: 'Deletar um usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
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

  @Get('Busca')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar um usuário',
    description: 'Buscar um usuário pelo id',
  })
  @ApiQuery({
    name: 'query',
    type: QueryUserDto,
  })
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

  @Get('termos/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'verifica os termos do usuário ',
    description: 'verifica os termos do usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
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

  @Patch('aceitar/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aceita os termos do usuário ',
    description: 'Aceita os termos do usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiBody({
    description: 'Dados para aceitar os termos',
    examples: {
      value: {
        summary: 'Exemplo',
        value: {
          termos: true,
        },
      },
    },
  })
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
    console.log(data);
    console.log(id);
    return await this.userService.updateTermos(+id, data);
  }

  @Get('role/:id')
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca a role do usuário ',
    description: 'Busca a role do usuário pelo id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Role encontrada com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Role nao encontrada',
    type: ErrorUserEntity,
  })
  async userRole(@Param('id') id: string) {
    if (!id) {
      const retorno: ErrorUserEntity = {
        message: 'ID do usuário nao informado',
      };
      throw new HttpException(retorno, 400);
    }
    return await this.userService.userRole(+id);
  }
}
