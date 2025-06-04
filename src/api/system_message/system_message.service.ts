import { HttpException, Injectable } from '@nestjs/common';
import { CreateSystemMessageDto } from './dto/create-system_message.dto';
import { UpdateSystemMessageDto } from './dto/update-system_message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class SystemMessageService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(SystemMessageService.name, {
    timestamp: true,
  });

  async create(data: CreateSystemMessageDto) {
    try {
      const systemMessage = await this.prisma.systemMessage.create({
        data,
      });
      return systemMessage;
    } catch (error) {
      this.logger.error(
        'Erro ao criar mensagem:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async findAll() {
    try {
      const systemMessages = await this.prisma.systemMessage.findMany();
      return systemMessages;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar mensagens:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async findOne(id: number) {
    try {
      const systemMessage = await this.prisma.systemMessage.findUnique({
        where: {
          id,
        },
      });
      return systemMessage;
    } catch (error) {
      this.logger.error(
        'Erro ao buscar mensagem:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async update(id: number, updateSystemMessageDto: UpdateSystemMessageDto) {
    try {
      const systemMessage = await this.prisma.systemMessage.update({
        where: {
          id,
        },
        data: {
          ...updateSystemMessageDto,
        },
      });
      return systemMessage;
    } catch (error) {
      this.logger.error(
        'Erro ao atualizar mensagem:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.systemMessage.delete({
        where: {
          id,
        },
      });
      return 'Alerta excluido com sucesso';
    } catch (error) {
      this.logger.error(
        'Erro ao deletar mensagem:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }
}
