import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserPayload } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login sucesso',
    type: UserPayload,
  })
  @ApiResponse({
    status: 401,
    description: 'Login falhou',
    type: String,
  })
  async Login(@Body() data: LoginDto) {
    return await this.authService.Login(data);
  }
}
