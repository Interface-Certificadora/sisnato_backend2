import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateArParceiraDto } from './dto/update-ar-parceira.dto';
import { CreateArParceiraDto } from './dto/create-ar-parceira.dto';

@Injectable()
export class ArParceiraService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.arParceira.findMany({
      orderBy: {
        nome: 'asc', // Ordena alfabeticamente
      },
      include: {
        cidade: {
          select: {
            id: true,
            nome: true,
            estado: {
              select: {
                sigla: true,
                nome: true,
              },
            },
          },
        },
      },
    });
  }
  async create(data: CreateArParceiraDto) {
    const cidadeExists = await this.prisma.cidade.findUnique({
      where: { id: data.cidadeId },
    });

    if (!cidadeExists) {
      throw new NotFoundException(
        `Cidade com ID ${data.cidadeId} não encontrada.`,
      );
    }

    return this.prisma.arParceira.create({
      data,
    });
  }

  // Buscar por ID
  async findOne(id: number) {
    const arParceira = await this.prisma.arParceira.findUnique({
      where: { id },
      include: {
        cidade: {
          include: { estado: true },
        },
      },
    });

    if (!arParceira) {
      throw new NotFoundException(`AR Parceira com ID ${id} não encontrada.`);
    }

    return arParceira;
  }

  async update(id: number, data: UpdateArParceiraDto) {
    await this.findOne(id);

    return this.prisma.arParceira.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.arParceira.delete({
      where: { id },
    });
  }

  async listUniqueAcs() {
    const result = await this.prisma.arParceira.findMany({
      distinct: ['ac'],
      select: { ac: true },
      where: {
        ac: { not: null },
      },
      orderBy: { ac: 'asc' },
    });

    return result
      .map((item) => item.ac)
      .filter((ac) => ac !== '' && ac !== null);
  }
}
