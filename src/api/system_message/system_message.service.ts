import { HttpException, Injectable } from '@nestjs/common';
import { CreateSystemMessageDto } from './dto/create-system_message.dto';
import { UpdateSystemMessageDto } from './dto/update-system_message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SystemMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSystemMessageDto) {
    try {
      const systemMessage = await this.prisma.systemMessage.create({
        data,
      });
      return systemMessage;
    } catch (error) {
      return new HttpException(error.message, error.status);
    }
  }

  async findAll() {
    try {
      const systemMessages = await this.prisma.systemMessage.findMany();
      return systemMessages;
    } catch (error) {
      return new HttpException(error.message, error.status);
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
      return new HttpException(error.message, error.status);
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
      return new HttpException(error.message, error.status);
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
      return new HttpException(error.message, error.status);
    }
  }
}
