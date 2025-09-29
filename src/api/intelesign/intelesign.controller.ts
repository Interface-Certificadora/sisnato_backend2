import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IntelesignService } from './intelesign.service';
import { CreateIntelesignDto } from './dto/create-intelesign.dto';
import { UpdateIntelesignDto } from './dto/update-intelesign.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ErrorEntity } from 'src/entities/error.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('intelesign')
export class IntelesignController {
  constructor(private readonly intelesignService: IntelesignService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        signatarios: {
          type: 'string',
          description: 'Array de IDs dos signatários',
          example:
            '[{"id": 1, "asstype": "simple || qualified", "type": "signer || approver || carbon-copy"}]',
        },
        valor: {
          type: 'number',
          description: 'Valor do documento',
          example: 100.0,
        },
        cca_id: {
          type: 'string',
          description: 'ID do CCA',
          example: '1',
        },
      },
      required: ['file'], // Defina os campos obrigatórios
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createIntelesignDto: CreateIntelesignDto, // Idealmente usar o DTO tipado
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.intelesignService.create(
      createIntelesignDto,
      file,
    );
    return result;
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Busca todas as Solicitações.',
    description:
      'Rota para buscar todas as Solicitações da plataforma com paginação e filtros.',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar Solicitações.',
    type: ErrorEntity,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    default: 1,
    description: 'Página atual',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 25,
    default: 25,
    description: 'Quantidade de itens por página',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    example: 'done',
    description:
      'Status do envelope, valores possíveis: done, waiting, in-transit, signing, rejected, failed, suspended',
  })
  @ApiQuery({
    name: 'id',
    required: false,
    type: Number,
    example: 1,
    description: 'ID do envelope',
  })
  @ApiQuery({
    name: 'signatario',
    required: false,
    type: String,
    example: 'John Doe',
    description: 'nome do signatário',
  })
  @ApiQuery({
    name: 'date_created',
    required: false,
    type: String,
    example: '2025-01-01T00:00:00.000Z',
    description: 'Data de criação do envelope em formato ISO',
  })
  @ApiQuery({
    name: 'id_cca',
    required: false,
    type: String,
    description: 'ID do CCA referente ao envelope',
  })
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status')
    status:
      | 'done'
      | 'waiting'
      | 'in-transit'
      | 'signing'
      | 'rejected'
      | 'failed'
      | 'suspended',
    @Query('id') id: number,
    @Query('signatario') signatario: string,
    @Query('date_created') date_created: string,
    @Query('id_cca') id_cca: string,
    @Req() req: any,
  ) {
    return this.intelesignService.findAll({
      ...(page && { page: +page }),
      ...(limit && { limit: +limit }),
      ...(status && { status: status }),
      ...(id && { id: +id }),
      ...(signatario && { signatario: signatario }),
      ...(date_created && { date_created: date_created }),
      ...(id_cca && { id_cca: +id_cca }),
      User: req.user,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.intelesignService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIntelesignDto: UpdateIntelesignDto,
  ) {
    return this.intelesignService.update(+id, updateIntelesignDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.intelesignService.remove(+id);
  }
}
