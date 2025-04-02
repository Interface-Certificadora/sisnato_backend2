import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NowService } from './now.service';
import { UpdateNowDto } from './dto/update-now.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Now } from './entities/now.entity';
import { ErrorNowEntity } from './entities/now.error.entity';

@Controller('now')
export class NowController {
  constructor(private readonly nowService: NowService) {}

  @Get('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retorna o Now',
    type: Now,
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    type: ErrorNowEntity,
  })
  async findOne(@Param('id') id: string) {
    return await this.nowService.findOne(+id);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Retorna o Now',
    type: Now,
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
    type: ErrorNowEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() updateNowDto: UpdateNowDto,
    @Req() req: any,
  ) {
    return await this.nowService.update(+id, updateNowDto, req.user);
  }
}
