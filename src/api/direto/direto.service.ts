import { HttpException, Injectable, Logger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'crypto';
import { plainToClass } from 'class-transformer';
import { UserPayload } from 'src/auth/entities/user.entity';
import { ErrorEntity } from 'src/entities/error.entity';
import { ErrorService } from 'src/error/error.service';
import { LogService } from 'src/log/log.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcwebProvider } from 'src/sequelize/providers/fcweb';
import { UpdateFcwebDto } from '../solicitacao/dto/update-fcweb.dto';
import { FcwebEntity } from '../solicitacao/entities/fcweb.entity';
import { SolicitacaoAllEntity } from '../solicitacao/entities/solicitacao.propety.entity';
import { CreateDiretoDto } from './dto/create-direto.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { filterDiretoDto } from './dto/filter-solicitacao.dto';
import { UpdateDiretoDto } from './dto/update-direto.dto';
import { Direto } from './entities/direto.entity';
import { ErrorDiretoEntity } from './entities/erro.direto.entity';
import { UserFinanceirasEntity } from './entities/user-financeiras.entity';

@Injectable()
export class DiretoService {
  constructor(
    private readonly prismaService: PrismaService,
    private Log: LogService,
    private jwtService: JwtService,
    private fcwebProvider: FcwebProvider,
    private LogError: ErrorService,
  ) {}
  private readonly logger = new Logger(DiretoService.name, {
    timestamp: true,
  });

  async create(createClienteDto: CreateDiretoDto) {
    try {
      const Exist = await this.prismaService.read.solicitacao.findFirst({
        where: {
          cpf: createClienteDto.cpf,
          direto: true,
          andamento: {
            notIn: ['EMITIDO', 'APROVADO', 'REVOGADO'],
          },
        },
      });
      if (Exist) {
        const retorno: ErrorDiretoEntity = {
          message: 'Cpf ja cadastrado',
        };
        throw new HttpException(retorno, 400);
      }
      // Remove `valor` do spread para evitar argumento desconhecido no Prisma e mapear para `valorcd`
      const { valor, token, ...rest } = createClienteDto;
      const tokenDecode = await this.decryptLink(token);
      const req = await this.prismaService.write.solicitacao.create({
        data: {
          ...rest,
          ...(tokenDecode?.cca && {
            financeiro: {
              connect: {
                id: tokenDecode.cca,
              },
            },
            empreendimento: {
              connect: {
                id: tokenDecode.empreendimento,
              },
            },
            corretor: {
              connect: {
                id: tokenDecode.corretorId,
              },
            },
          }),
          direto: true,
          ativo: true,
          distrato: false,
          valorcd: valor,
        },
      });
      if (!req) {
        const retorno: ErrorDiretoEntity = {
          message: 'ERRO AO CRIAR CLIENTE',
        };
        throw new HttpException(retorno, 400);
      }
      return plainToClass(Direto, req);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findAll(
    pagina: number,
    limite: number,
    filtro: filterDiretoDto,
    UserData: any,
  ) {
    try {
      const { nome, id, andamento, empreendimento, financeiro } = filtro;
      const PaginaAtual = pagina || 1;
      const Limite = !!andamento ? 50 : limite ? limite : 20;
      const Offset = (PaginaAtual - 1) * Limite;
      const EmpId = UserData?.empreendimento || [];
      const FinId = UserData?.Financeira || [];

      const FilterWhere = {
        direto: true,
        ...(UserData?.hierarquia !== 'ADM' && {
          // corretor: UserData.id,
          empreendimento: {
            id: {
              in: EmpId,
            },
          },
          financeiro: {
            id: {
              in: FinId,
            },
          },
          ativo: true,
          distrato: false,
          direto: true,
        }),
        ...(nome && {
          nome: {
            contains: nome,
          },
        }),
        ...(id && {
          id: +id,
        }),
        ...(andamento && {
          andamento: andamento,
        }),
        ...(empreendimento && {
          empreendimento: {
            id: +empreendimento,
          },
        }),
        ...(financeiro && {
          financeiro: {
            id: +financeiro,
          },
        }),
      };

      const count = await this.prismaService.read.solicitacao.count({
        where: FilterWhere,
      });

      const select = {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        andamento: true,
        alerts: true,
        distrato: true,
        dt_agendamento: true,
        hr_agendamento: true,
        dt_aprovacao: true,
        hr_aprovacao: true,
        type_validacao: true,
        alertanow: true,
        pg_andamento: true,
        pg_date: true,
        pg_status: true,
        pixCopiaECola: true,
        imagemQrcode: true,
        txid: true,
        corretor: {
          select: {
            id: true,
            nome: true,
          },
        },
        construtora: {
          select: {
            id: true,
            fantasia: true,
          },
        },
        empreendimento: {
          select: {
            id: true,
            nome: true,
            cidade: true,
          },
        },
        financeiro: {
          select: {
            id: true,
            fantasia: true,
          },
        },
        id_fcw: true,
        statusAtendimento: true,
        ativo: true,
        pause: true,
        tags: true,
        createdAt: true,
      };

      let req = await this.prismaService.read.solicitacao.findMany({
        where: FilterWhere,
        orderBy: { createdAt: 'desc' },
        select,
        skip: Offset,
        take: Limite,
      });

      // Create a deep copy of the req array to avoid reference issues
      const updatedReq = JSON.parse(JSON.stringify(req));

      // Process all Fcweb updates
      const updatePromises = updatedReq.map(
        async (item: any, index: string | number) => {
          if (item.andamento !== 'EMITIDO') {
            try {
              const ficha = item.id_fcw
                ? await this.GetFcweb(item.id_fcw)
                : await this.GetFcwebExist(item.cpf);

              if (ficha && ficha.andamento) {
                // Helper function to safely parse time values
                const formatTimeString = (timeString: any) => {
                  if (!timeString) return null;
                  // If it's already a valid Date object
                  if (
                    timeString instanceof Date &&
                    !isNaN(timeString.getTime())
                  ) {
                    return timeString;
                  }
                  // Handle MySQL TIME format (HH:MM:SS)
                  if (
                    typeof timeString === 'string' &&
                    timeString.includes(':')
                  ) {
                    const today = new Date();
                    const [hours, minutes, seconds] = timeString
                      .split(':')
                      .map(Number);

                    if (
                      !isNaN(hours) &&
                      !isNaN(minutes) &&
                      (!seconds || !isNaN(seconds))
                    ) {
                      today.setHours(hours, minutes, seconds || 0, 0);
                      return today;
                    }
                  }
                  return null;
                };

                // Helper function to safely parse date values
                const formatDateString = (dateString: any) => {
                  if (!dateString) return null;

                  // If it's already a valid Date object
                  if (
                    dateString instanceof Date &&
                    !isNaN(dateString.getTime())
                  ) {
                    return dateString;
                  }

                  // Try to parse the date string
                  const parsedDate = new Date(dateString);

                  // Check if the parsed date is valid
                  if (isNaN(parsedDate.getTime())) {
                    console.warn(`Data inválida recebida: ${dateString}`);
                    return null;
                  }

                  return parsedDate;
                };
                // Update the database
                await this.prismaService.write.solicitacao.update({
                  where: { id: item.id },
                  data: {
                    ...(ficha.nome && { nome: ficha.nome }),
                    ...(ficha.id && { id_fcw: ficha.id }),
                    ...(ficha.andamento && { andamento: ficha.andamento }),
                    dt_agendamento: formatDateString(ficha.dt_agenda),
                    hr_agendamento: formatTimeString(ficha.hr_agenda),
                    dt_aprovacao: formatDateString(ficha.dt_aprovacao),
                    hr_aprovacao: formatTimeString(ficha.hr_aprovacao),
                  },
                });
                // Update our local copy
                updatedReq[index] = {
                  ...item,
                  andamento: ficha.andamento,
                  dt_agendamento: formatDateString(ficha.dt_agenda),
                  hr_agendamento: formatTimeString(ficha.hr_agenda),
                  dt_aprovacao: formatDateString(ficha.dt_aprovacao),
                  hr_aprovacao: formatTimeString(ficha.hr_aprovacao),
                };
              }
            } catch (error) {
              this.LogError.Post(JSON.stringify(error, null, 2));
              console.error(`Error updating item ${item.id}:`, error);
            }
          }
          return item;
        },
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      // Return the updated data
      return plainToClass(SolicitacaoAllEntity, {
        total: count,
        data: updatedReq,
        pagina: PaginaAtual,
        limite: Limite,
      });
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar solicitacao:',
        JSON.stringify(error, null, 2),
      );
      const retorno: ErrorEntity = {
        message: error.message,
      };
      throw new HttpException(retorno, 400);
    }
  }

  async findOne(id: number) {
    try {
      const request = await this.prismaService.read.solicitacao.findUnique({
        where: {
          id: id,
          direto: true,
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao buscar Cliente',
        };
        throw new HttpException(retorno, 400);
      }
      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.read.$disconnect;
    }
  }

  async update(id: number, updateDiretoDto: UpdateDiretoDto, User: any) {
    try {
      const request = await this.prismaService.write.solicitacao.update({
        where: {
          id: id,
          direto: true,
        },
        data: {
          ...updateDiretoDto,
          ...(updateDiretoDto.financeiro && {
            financeiro: {
              connect: {
                id: updateDiretoDto.financeiro,
              },
            },
          }),
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao atualizar Cliente',
        };
        throw new HttpException(retorno, 400);
      }
      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Direto',
        Descricao: `O Usuário ${User.id}-${User.nome} atualizou a Solicitacao Direto ID: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.write.$disconnect;
    }
  }

  async remove(id: number, User: any) {
    try {
      const request = await this.prismaService.write.solicitacao.update({
        where: {
          id: id,
          direto: true,
        },
        data: {
          ativo: false,
        },
      });
      if (!request) {
        const retorno: ErrorDiretoEntity = {
          message: 'Erro ao desativar Cliente',
        };
        throw new HttpException(retorno, 400);
      }

      await this.Log.Post({
        User: User.id,
        EffectId: id,
        Rota: 'Direto',
        Descricao: `O Usuário ${User.id}-${User.nome} desativou a Solicitacao Direto ID: ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return plainToClass(Direto, request);
    } catch (error) {
      console.log(error);
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    } finally {
      this.prismaService.write.$disconnect;
    }
  }

  async getFinanceirosDoUsuario(user: UserPayload) {
    try {
      if (!user.id) {
        throw new HttpException(
          'Usuário não encontrado, ou não possui id',
          400,
        );
      }
      const usuarioComFinanceiros =
        await this.prismaService.read.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            financeiros: {
              where: {
                financeiro: {
                  direto: true,
                },
              },
              select: {
                financeiro: {
                  select: {
                    id: true,
                    fantasia: true,
                  },
                },
              },
            },
          },
        });

      if (!usuarioComFinanceiros) {
        throw new HttpException(
          {
            message: 'CCa e usuario não possui liberação de para trabalhar',
          },
          400,
        );
      }

      const financeirosFormatados = usuarioComFinanceiros.financeiros.map(
        (item) => new UserFinanceirasEntity(item.financeiro),
      );
      console.log(financeirosFormatados);

      return financeirosFormatados;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Financeiros do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async GetFcweb(id: number): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
    nome?: string;
  } | null> {
    try {
      const fcweb = await this.fcwebProvider.findByIdMin(id);
      if (!fcweb) {
        this.logger.warn(`Registro Fcweb com ID ${id} não encontrado`);
        return null;
      }
      return fcweb;
    } catch (error) {
      this.logger.error(`Erro ao buscar Fcweb com ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Busca um registro do Fcweb pelo CPF
   * @param cpf - CPF do cliente
   * @returns Promise com o registro ou null se não encontrado
   */
  async GetFcwebExist(cpf: string): Promise<{
    id: number;
    andamento: string;
    dt_agenda: Date;
    hr_agenda: string;
    dt_aprovacao: Date;
    hr_aprovacao: string;
    nome: string;
  } | null> {
    if (!cpf) {
      this.logger.warn('CPF não fornecido para busca no Fcweb');
      return null;
    }

    try {
      const fcweb = await this.fcwebProvider.findByCpf(cpf);
      if (!fcweb) {
        // this.logger.warn(`Nenhum registro encontrado para o CPF: ${cpf}`);
        return null;
      }
      return fcweb;
    } catch (error) {
      this.logger.error(`Erro ao buscar Fcweb com CPF ${cpf}:`, error);
      return null;
    }
  }

  /**
   * Atualiza um registro do Fcweb pelo seu ID.
   * @param {number} id - ID do registro do Fcweb.
   * @param {UpdateFcwebDto} data - Dados para atualização.
   * @param {UserPayload} user - Usuário que está realizando a atualização.
   * @returns {Promise<FcwebEntity>} - Registro do Fcweb atualizado.
   */
  async GetFcwebAtt(
    id: number,
    data: UpdateFcwebDto,
    user: UserPayload,
  ): Promise<FcwebEntity | null> {
    try {
      // Atualiza a solicitação no banco de dados
      const solicitacaoAtualizada =
        await this.prismaService.write.solicitacao.update({
          where: { id },
          data: { ...data },
        });

      // Registra a ação no log
      await this.Log.Post({
        User: user.id,
        EffectId: id,
        Rota: 'solicitacao',
        Descricao: `O Usuário ${user.id}-${user.nome} criou um FiCha FCWEB para a Solicitacao ${id} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      // Busca os dados completos da ficha FCWEB
      const fichaFcweb = await this.fcwebProvider.findByIdMin(id);

      if (!fichaFcweb) {
        throw new Error('Ficha FCWEB não encontrada');
      }

      // Mapeia os dados para o formato FcwebEntity
      return {
        id: fichaFcweb.id,
        andamento: fichaFcweb.andamento || '',
        dt_agenda: fichaFcweb.dt_agenda,
        hr_agenda: fichaFcweb.hr_agenda,
        dt_aprovacao: fichaFcweb.dt_aprovacao,
        hr_aprovacao: fichaFcweb.hr_aprovacao,
      };
    } catch (error) {
      this.LogError.Post(JSON.stringify(error, null, 2));
      this.logger.error(
        'Erro ao buscar fcweb:',
        JSON.stringify(error, null, 2),
      );
      return null;
    }
  }

  async checkCpf(cpf: string) {
    try {
      console.log(cpf);
      const request = await this.prismaService.read.solicitacao.findFirst({
        where: {
          cpf: cpf,
          direto: true,
          // andamento deve ser diferente de EMITIDO, APROVADO e REVOGADO
          andamento: {
            in: ['EMITIDO', 'APROVADO', 'REVOGADO'],
          },
        },
      });
      console.log(request);
      console.log(!!request);
      return !!request;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async checkFinanceira(id: number) {
    try {
      const request = await this.prismaService.read.financeiro.findFirst({
        where: {
          id: id,
          direto: true,
        },
        select: {
          id: true,
          fantasia: true,
          valor_cert: true,
        },
      });
      if (!request) {
        throw new Error('Financeira não encontrada');
      }
      return request;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Financeiros do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async atualizarCliente(txid: string, data: any) {
    try {
      const request = await this.prismaService.write.solicitacao.findFirst({
        where: {
          txid: txid,
          direto: true,
        },
      });
      if (!request) {
        throw new Error('Solicitação não encontrada');
      }
      const update = await this.prismaService.write.solicitacao.update({
        where: {
          id: request.id,
        },
        data: {
          pg_andamento: data.pg_andamento,
        },
      });
      return update;
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Solicitação do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async createLink(data: CreateLinkDto, User: UserPayload) {
    try {
      const { baseUrl, financeiroId, empreendimentoId } = data;
      const payload = {
        cca: financeiroId,
        empreendimento: empreendimentoId,
        corretorId: User.id
      };
      const token = await this.cryptLink(JSON.stringify(payload));
      const link = `${baseUrl}?id=${token}`;

      return { message: 'Link criado com sucesso', link };
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Solicitação do Usuário');
      const retorno: ErrorDiretoEntity = {
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async getInfosToken(token: string) {
    try {
      const payload = await this.decryptLink(token);
      const data = JSON.parse(payload || '{}');

      const financeira = await this.checkFinanceira(data.cca);
      
      return {
        success: true,
        message: 'token decodificado com sucesso',
        data: {
          financeira: {
            ...financeira,
            valor_cert: financeira.valor_cert
          },
          empreendimento: data.empreendimento,
          corretorId: data.corretorId
        }
      };
    } catch (error) {
      this.logger.error(error, 'Erro ao buscar Solicitação do Usuário');
      const retorno = {
        success: false,
        message: error.message ? error.message : 'ERRO DESCONHECIDO',
      };
      throw new HttpException(retorno, 400);
    }
  }

  async cryptLink(payload: string) {
    // Espera-se um JSON com { cca: number, empreendimento: number, corretorId: number }
    // Gera um token de 30 caracteres hex: 8 bytes de dados + 7 bytes de MAC (HMAC-SHA256 truncado)
    try {
      const secret = this.getLinkSecret();
      const data = JSON.parse(payload || '{}');

      // Validação e conversão robusta dos valores
      const cca = this.parseAndValidateNumber(data.cca, 'cca');
      const empreendimento = this.parseAndValidateNumber(data.empreendimento, 'empreendimento');
      const corretorId = this.parseAndValidateNumber(data.corretorId, 'corretorId');

      // Validação de limites
      if (
        cca < 0 ||
        empreendimento < 0 ||
        corretorId < 0 ||
        cca > 0xfffff ||
        empreendimento > 0xfffff ||
        corretorId > 0xfffff
      ) {
        throw new Error(
          'Valores fora do limite: use 0 <= cca, empreendimento, corretorId <= 1.048.575',
        );
      }

      const packed = this.packPayload({ cca, empreendimento, corretorId }); // 8 bytes
      const mac = this.computeMac(packed, secret); // 7 bytes
      const token = Buffer.concat([packed, mac]).toString('hex'); // 15 bytes => 30 hex
      return token;
    } catch (error) {
      this.logger.error(error, 'Erro ao gerar token curto do link');
      throw new HttpException(
        { message: error.message || 'Falha ao gerar link' },
        400,
      );
    }
  }

  async decryptLink(hash: string): Promise<{cca: number, empreendimento: number, corretorId: number}> {
    // Recebe token de 30 caracteres hex, valida o MAC e retorna o payload original em string JSON
    try {
      if (!hash || typeof hash !== 'string' || hash.length !== 30) {
        throw new Error('Token inválido: deve conter 30 caracteres hex');
      }
      const secret = this.getLinkSecret();
      const buf = Buffer.from(hash, 'hex');
      if (buf.length !== 15) {
        throw new Error('Token inválido: tamanho incorreto');
      }
      const packed = buf.subarray(0, 8);
      const mac = buf.subarray(8, 15);
      const macCalc = this.computeMac(packed, secret);
      if (!mac.equals(macCalc)) {
        throw new Error('Token inválido: MAC não confere');
      }
      const { cca, empreendimento, corretorId } = this.unpackPayload(packed);
      return JSON.stringify({ cca, empreendimento, corretorId });
    } catch (error) {
      this.logger.error(error, 'Erro ao validar token curto do link');
      throw new HttpException(
        { message: error.message || 'Token inválido' },
        400,
      );
    }
  }

  // Helpers
  private getLinkSecret(): Buffer {
    const secretStr = process.env.LINK_TOKEN_SECRET;
    if (!secretStr || secretStr.length < 16) {
      throw new Error(
        'LINK_TOKEN_SECRET não configurado ou muito curto (mínimo 16 caracteres)',
      );
    }
    return Buffer.from(secretStr, 'utf8');
  }

  // Empacota version(4 bits)=1, cca(20 bits), empreendimento(20 bits), corretorId(20 bits) => 64 bits dentro de 8 bytes
  private packPayload(input: { cca: number; empreendimento: number, corretorId: number }): Buffer {
    const version = 1; // 4 bits
    const cca = input.cca & 0xfffff; // 20 bits
    const emp = input.empreendimento & 0xfffff; // 20 bits
    const cor = input.corretorId & 0xfffff; // 20 bits

    // [VVVV][CCCCCCCCCCCCCCCCCCCC][EEEEEEEEEEEEEEEEEEEE][PPPPPPPPPPPPPPPPPPPP]
    // V=version(4b), C=cca(20b), E=emp(20b), P=corretorId(20b)
    const big =
      (BigInt(version & 0x0f) << 60n) |
      (BigInt(cca) << 40n) |
      (BigInt(emp) << 20n) |
      (BigInt(cor) << 0n);

    const buf = Buffer.alloc(8);
    // big-endian 64 bits
    buf[0] = Number((big >> 56n) & 0xffn);
    buf[1] = Number((big >> 48n) & 0xffn);
    buf[2] = Number((big >> 40n) & 0xffn);
    buf[3] = Number((big >> 32n) & 0xffn);
    buf[4] = Number((big >> 24n) & 0xffn);
    buf[5] = Number((big >> 16n) & 0xffn);
    buf[6] = Number((big >> 8n) & 0xffn);
    buf[7] = Number(big & 0xffn);
    return buf;
  }

  private unpackPayload(buf: Buffer): { cca: number; empreendimento: number, corretorId: number } {
    if (buf.length !== 8) throw new Error('Buffer inválido para payload');
    const big =
      (BigInt(buf[0]) << 56n) |
      (BigInt(buf[1]) << 48n) |
      (BigInt(buf[2]) << 40n) |
      (BigInt(buf[3]) << 32n) |
      (BigInt(buf[4]) << 24n) |
      (BigInt(buf[5]) << 16n) |
      (BigInt(buf[6]) << 8n) |
      BigInt(buf[7]);

    const version = Number((big >> 60n) & 0x0fn);
    if (version !== 1) throw new Error('Versão de token não suportada');
    const cca = Number((big >> 40n) & 0xfffffn); // 20 bits
    const empreendimento = Number((big >> 20n) & 0xfffffn); // 20 bits
    const corretorId = Number((big >> 0n) & 0xfffffn); // 20 bits
    return { cca, empreendimento, corretorId };
  }

  private computeMac(packed: Buffer, secret: Buffer): Buffer {
    const macFull = createHmac('sha256', secret).update(packed).digest();
    return macFull.subarray(0, 7); // 7 bytes (56 bits) => 14 hex chars
  }

  // Helper method para validação robusta de números
  private parseAndValidateNumber(value: any, fieldName: string): number {
    // Verificar se o valor é undefined ou null
    if (value === undefined || value === null) {
      throw new Error(`Campo '${fieldName}' é obrigatório e não pode ser nulo ou indefinido`);
    }

    // Verificar se é uma string vazia
    if (typeof value === 'string' && value.trim() === '') {
      throw new Error(`Campo '${fieldName}' não pode ser uma string vazia`);
    }

    // Converter para número
    const numValue = Number(value);

    // Verificar se a conversão resultou em NaN
    if (isNaN(numValue)) {
      throw new Error(`Campo '${fieldName}' deve ser um número válido. Valor recebido: ${JSON.stringify(value)} (tipo: ${typeof value})`);
    }

    // Verificar se é um número inteiro
    if (!Number.isInteger(numValue)) {
      throw new Error(`Campo '${fieldName}' deve ser um número inteiro. Valor recebido: ${numValue}`);
    }

    return numValue;
  }
}
