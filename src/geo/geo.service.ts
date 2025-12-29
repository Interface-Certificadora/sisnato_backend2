import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GeoService {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarUnidadesProximas(cidadeId: number) {
    // 1. Pega coordenadas da cidade do usuário
    const cidadeUser = await this.prisma.cidade.findUnique({
      where: { id: cidadeId },
      include: { estado: true },
    });

    if (!cidadeUser) {
      throw new NotFoundException('Cidade não encontrada.');
    }
    const latitude = cidadeUser.latitude;
    const longitude = cidadeUser.longitude;

    // 2. Query Inteligente:
    // - Calcula distância
    // - Seleciona apenas as TOP 3 cidades mais próximas
    // - Traz TODOS os parceiros dessas 3 cidades
    const rawResult: any[] = await this.prisma.$queryRaw`
      WITH BaseDados AS (
        SELECT 
          p.id, 
          p.nome, 
          p."cidadeId",
          c.nome as cidade_nome,
          e.sigla as estado_sigla,
          p.endereco,
          p.telefone,
          p.responsavel,
          p.valor,
          p.obs,
          c.latitude, 
          c.longitude,
          (earth_distance(
              ll_to_earth(${latitude}, ${longitude}),
              ll_to_earth(c.latitude, c.longitude)
          ) / 1000) as distancia_km
        FROM "ArParceira" p
        INNER JOIN "cidades" c ON p."cidadeId" = c.id
        INNER JOIN "estados" e ON c."codigo_uf" = e.id
        WHERE p."status" = true
      ),
      CidadesMaisProximas AS (
        SELECT "cidadeId", MIN(distancia_km) as dist_minima
        FROM BaseDados
        GROUP BY "cidadeId"
        ORDER BY dist_minima ASC
        LIMIT 3 -- AQUI: Limitamos a 3 CIDADES, não a 3 parceiros
      )
      SELECT b.* FROM BaseDados b
      INNER JOIN CidadesMaisProximas cmp ON b."cidadeId" = cmp."cidadeId"
      ORDER BY b.distancia_km ASC, b.nome ASC;
    `;

    if (rawResult.length === 0) {
      return {
        mensagem: 'Nenhuma parceira encontrada nesta região.',
        cidade_cliente: {
          nome: cidadeUser.nome,
          uf: cidadeUser.estado?.sigla || 'UF',
        },
        unidades_agrupadas: [],
      };
    }

    // 3. Agrupamento no JavaScript (Transformação de Dados)
    // O objetivo é criar um array de Cidades, onde cada cidade tem sua lista de parceiros.
    const cidadesMap = new Map();

    rawResult.forEach((row) => {
      const cidadeKey = `${row.cidade_nome} - ${row.estado_sigla}`;

      if (!cidadesMap.has(cidadeKey)) {
        cidadesMap.set(cidadeKey, {
          cidade: row.cidade_nome,
          uf: row.estado_sigla,
          distancia_km: Math.round(row.distancia_km * 10) / 10,
          parceiros: [], // Lista vazia para começar
        });
      }

      // Adiciona o parceiro na lista daquela cidade
      cidadesMap.get(cidadeKey).parceiros.push({
        id: row.id,
        nome: row.nome,
        endereco: row.endereco,
        telefone: row.telefone,
        responsavel: row.responsavel,
        valor: row.valor,
        obs: row.obs,
      });
    });

    // Converte o Map de volta para Array
    const unidadesAgrupadas = Array.from(cidadesMap.values());

    return {
      cidade_cliente: {
        nome: cidadeUser.nome,
        uf: cidadeUser.estado?.sigla || 'UF',
      },
      unidades: unidadesAgrupadas, // Agora o front recebe por cidade
    };
  }

  async listarEstados() {
    return this.prisma.estado.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async listarCidadesPorEstado(estadoId: number) {
    return this.prisma.cidade.findMany({
      where: { codigo_uf: estadoId },
      orderBy: { nome: 'asc' },
    });
  }
}
