import { HttpException, Injectable } from '@nestjs/common';
import { CreateSystemMessageDto } from './dto/create-system_message.dto';
import { UpdateSystemMessageDto } from './dto/update-system_message.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SystemMessageService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSystemMessageDto) {
    try {
      const systemMessage = this.prisma.systemMessage.create({
        data,
      });
      return systemMessage;
    } catch (error) {
      return new HttpException(error.message, error.status);
    }
  }

  findAll() {
    try {
      const systemMessages = this.prisma.systemMessage.findMany();
      return systemMessages;
    } catch (error) {
      return new HttpException(error.message, error.status);
    }
  }

  findOne(id: number) {
    try {
      const systemMessage = this.prisma.systemMessage.findUnique({
        where: {
          id,
        },
      });
      return systemMessage;
    } catch (error) {
      return new HttpException(error.message, error.status);
    }
  }

  update(id: number, updateSystemMessageDto: UpdateSystemMessageDto) {
    try {
      const systemMessage = this.prisma.systemMessage.update({
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

  remove(id: number) {
    try {
      this.prisma.systemMessage.delete({
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
