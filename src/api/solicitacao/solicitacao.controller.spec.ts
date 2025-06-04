import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoService } from './solicitacao.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../log/log.service';
import { SmsService } from '../../sms/sms.service';
import { HttpException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { SolicitacaoEntity } from './entities/solicitacao.entity';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { filterSolicitacaoDto } from './dto/filter-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;
  let prismaService: PrismaService;
  let smsService: SmsService;
  let logsService: LogService;

  const updateSolicitacaoDto: UpdateSolicitacaoDto = {
    nome: 'Solicitação Atualizada',
    email: 'atualizado@email.com',
    cpf: '12345678900',
    telefone: '11999999999',
    relacionamentos: ['12345678901', '12345678902'],
    construtora: 1,
    empreendimento: 1,
    financeiro: 1,
  } as UpdateSolicitacaoDto;

  const mockUpdatedSolicitacao = {
    id: 1,
    nome: 'Solicitação Atualizada',
    email: 'atualizado@email.com',
    cpf: '12345678900',
    telefone: '11999999999',
    corretorId: 1,
    construtoraId: 1,
    financeiroId: 1,
    empreendimentoId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    corretor: { id: 1, nome: 'John Doe', telefone: '11999999999' },
    financeiro: { id: 1, fantasia: 'Financeiro 1' },
    construtora: { id: 1, fantasia: 'Construtora 1' },
    empreendimento: { id: 1, nome: 'Empreendimento 1', cidade: 'São Paulo' },
    relacionamentos: [],
    tags: [],
    chamados: [],
    alerts: [],
    Logs: [],
  };

  const mockCreateSolicitacaoDto: CreateSolicitacaoDto = {
    nome: 'Solicitação 1',
    email: 'exemplo@email.com',
    cpf: '12345678900',
    telefone: '11999999999',
    telefone2: '11988888888',
    dt_nascimento: new Date('1990-01-01'),
    id_fcw: 123,
    obs: 'Observação',
    cnh: '123456789',
    ativo: true,
    uploadRg: 'https://example.com/rg.jpg',
    uploadCnh: 'https://example.com/cnh.jpg',
    rela_quest: true,
    distrato: true,
    dt_distrato: new Date(),
    status_aprovacao: true,
    distrato_id: 2,
    andamento: 'Andamento da solicitação',
    type_validacao: 'Validação',
    dt_aprovacao: new Date(),
    hr_aprovacao: '12:00',
    dt_agendamento: new Date(),
    hr_agendamento: '15:00',
    corretor: 1,
    construtora: 1,
    financeiro: 1,
    empreendimento: 1,
    relacionamentos: ['12345678901', '12345678902'],
  } as unknown as CreateSolicitacaoDto;

  // Criamos uma cópia sem o campo relacionamentos para o teste de create
  const mockCreateSolicitacaoDtoWithoutRelacionamentos = {
    ...mockCreateSolicitacaoDto,
  };
  delete mockCreateSolicitacaoDtoWithoutRelacionamentos.relacionamentos;

  const mockUserPayload = {
    id: 1,
    nome: 'John Doe',
    construtora: [1],
    empreendimento: [1],
    hierarquia: 'ADMIN',
    Financeira: [1],
  };

  const mockRelacionamentos = [
    { id: 2, cpf: '12345678901', nome: 'Relacionamento 1' },
    { id: 3, cpf: '12345678902', nome: 'Relacionamento 2' },
  ];
  const mockCreatedSolicitacao = {
    id: 1,
    nome: 'Solicitação 1',
    email: 'exemplo@email.com',
    cpf: '12345678900',
    telefone: '11999999999',
    telefone2: '11988888888',
    ativo: true,

    corretor: {
      id: 1,
      nome: 'John Doe',
      telefone: '123456789',
    },
    financeiro: {
      id: 1,
      fantasia: 'Financeiro 1',
    },
    construtora: {
      id: 1,
      fantasia: 'Construtora 1',
    },
    empreendimento: {
      id: 1,
      nome: 'Empreendimento 1',
      cidade: 'São Paulo',
    },
  };

  const mockFinalSolicitacao = {
    ...mockCreatedSolicitacao,
    relacionamentos: [
      { solicitacaoId: 1, relacionadaId: 2 },
      { solicitacaoId: 1, relacionadaId: 3 },
    ],
    Logs: [{ descricao: 'Solicitação criada por 1-John Doe - alguma data' }],
  };

  const mockSolicitacaoList = [
    {
      id: 1,
      nome: 'Solicitação 1',
      cpf: '12345678900',
      alerts: [],
      distrato: false,
      dt_agendamento: new Date(),
      hr_agendamento: '15:00',
      dt_aprovacao: new Date(),
      hr_aprovacao: '12:00',
      type_validacao: 'Validação',
      alertanow: false,
      statusAtendimento: 'Pendente',
      pause: false,
      andamento: 'Em andamento',
      financeiro: {
        id: 1,
        fantasia: 'Financeiro 1',
      },
      construtora: {
        id: 1,
        fantasia: 'Construtora 1',
      },
      empreendimento: {
        id: 1,
        nome: 'Empreendimento 1',
      },
      corretor: {
        id: 1,
        nome: 'John Doe',
      },
    },
    {
      id: 2,
      nome: 'Solicitação 2',
      cpf: '98765432100',
      alerts: [],
      distrato: false,
      dt_agendamento: new Date(),
      hr_agendamento: '16:00',
      dt_aprovacao: new Date(),
      hr_aprovacao: '13:00',
      type_validacao: 'Validação',
      alertanow: false,
      statusAtendimento: 'Concluído',
      pause: false,
      andamento: 'Finalizado',
      financeiro: {
        id: 1,
        fantasia: 'Financeiro 1',
      },
      construtora: {
        id: 1,
        fantasia: 'Construtora 1',
      },
      empreendimento: {
        id: 1,
        nome: 'Empreendimento 1',
      },
      corretor: {
        id: 1,
        nome: 'John Doe',
      },
    },
  ];

  const mockSolicitacaoDetail = {
    id: 1,
    nome: 'Solicitação 1',
    email: 'exemplo@email.com',
    cpf: '12345678900',
    telefone: '11999999999',
    telefone2: '11988888888',
    dt_nascimento: new Date('1990-01-01'),
    id_fcw: 123,
    obs: 'Observação',
    cnh: '123456789',
    ativo: true,
    uploadRg: 'https://example.com/rg.jpg',
    uploadCnh: 'https://example.com/cnh.jpg',
    rela_quest: true,
    distrato: false,
    dt_distrato: null,
    status_aprovacao: true,
    distrato_id: null,
    andamento: 'Em andamento',
    type_validacao: 'Validação',
    dt_aprovacao: new Date(),
    hr_aprovacao: '12:00',
    dt_agendamento: new Date(),
    hr_agendamento: '15:00',
    alerts: [],
    alertanow: false,
    statusAtendimento: 'Pendente',
    pause: false,
    corretor: {
      id: 1,
      nome: 'John Doe',
      telefone: '11999999999',
    },
    financeiro: {
      id: 1,
      fantasia: 'Financeiro 1',
    },
    construtora: {
      id: 1,
      fantasia: 'Construtora 1',
    },
    empreendimento: {
      id: 1,
      nome: 'Empreendimento 1',
      cidade: 'São Paulo',
    },
    relacionamentos: [],
    tags: [],
    chamados: [],
    Logs: [{ descricao: 'Solicitação criada por 1-John Doe - alguma data' }],
  };

  const findManyMock = jest.fn().mockResolvedValue(mockSolicitacaoList);
  const findFirstMock = jest.fn().mockResolvedValue(mockSolicitacaoDetail);
  const countMock = jest.fn().mockResolvedValue(2);
  const updateMock = jest.fn();

  beforeEach(async () => {
    findManyMock.mockResolvedValue(mockRelacionamentos);
    findFirstMock.mockResolvedValue(mockUpdatedSolicitacao);
    updateMock.mockResolvedValue(mockUpdatedSolicitacao);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitacaoService,
        {
          provide: PrismaService,
          useValue: {
            solicitacao: {
              findMany: findManyMock, // Use the mocks you defined earlier
              create: jest.fn().mockResolvedValue(mockCreatedSolicitacao),
              findUnique: jest.fn().mockResolvedValue(mockFinalSolicitacao),
              count: countMock, // Add this
              findFirst: findFirstMock, // Add this
              update: updateMock,
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            },
            solicitacaoRelacionamento: {
              create: jest.fn().mockResolvedValue({}),
              deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
            tag: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: SmsService,
          useValue: {
            sendSms: jest.fn().mockResolvedValue({ status: 200 }),
          },
        },
        {
          provide: LogService,
          useValue: {
            Post: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<SolicitacaoService>(SolicitacaoService);
    prismaService = module.get<PrismaService>(PrismaService);
    smsService = module.get<SmsService>(SmsService);
    logsService = module.get<LogService>(LogService);

    // Limpar os mocks entre os testes
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a solicitacao with SMS sending (success case)', async () => {
      // Mock plainToClass
      jest
        .spyOn(require('class-transformer'), 'plainToClass')
        .mockReturnValue(mockFinalSolicitacao);

      const result = await service.create(
        mockCreateSolicitacaoDto,
        1,
        mockUserPayload,
      );

      // Verificar se prisma foi chamado para encontrar solicitações relacionadas
      expect(prismaService.solicitacao.findMany).toHaveBeenCalledWith({
        where: {
          cpf: {
            in: mockCreateSolicitacaoDto.relacionamentos,
          },
        },
      });

      // Verificar se prisma foi chamado para criar a solicitação
      // Note que estamos desestruturando para remover relacionamentos
      const { relacionamentos, ...restDto } = mockCreateSolicitacaoDto;
      expect(prismaService.solicitacao.create).toHaveBeenCalledWith({
        data: {
          ...restDto,
          ativo: true,
          corretor: { connect: { id: mockUserPayload.id } },
          financeiro: { connect: { id: mockCreateSolicitacaoDto.financeiro } },
          construtora: {
            connect: { id: mockCreateSolicitacaoDto.construtora },
          },
          empreendimento: {
            connect: { id: mockCreateSolicitacaoDto.empreendimento },
          },
        },
        include: {
          corretor: {
            select: {
              id: true,
              nome: true,
              telefone: true,
            },
          },
          financeiro: {
            select: {
              id: true,
              fantasia: true,
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
        },
      });

      // Verificar se os relacionamentos foram criados
      expect(
        prismaService.solicitacaoRelacionamento.create,
      ).toHaveBeenCalledTimes(2);

      // Verificar se o SMS foi enviado (2 para número principal e 2 para número secundário)
      expect(smsService.sendSms).toHaveBeenCalledTimes(4);

      // Verificar se o log foi criado
      expect(logsService.Post).toHaveBeenCalledWith({
        User: mockUserPayload.id,
        EffectId: mockCreatedSolicitacao.id,
        Rota: 'solicitacao',
        Descricao: expect.stringContaining('Solicitação criada por 1-John Doe'),
      });

      // Verificar se a seleção final foi realizada
      expect(prismaService.solicitacao.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreatedSolicitacao.id },
        include: {
          corretor: true,
          financeiro: true,
          construtora: true,
          empreendimento: true,
          relacionamentos: true,
          Logs: {
            select: {
              descricao: true,
            },
          },
        },
      });

      // Verificar o resultado
      expect(result).toEqual(mockFinalSolicitacao);
    });

    it('should create a solicitacao without SMS sending when sms param is 0', async () => {
      // Mock plainToClass
      jest
        .spyOn(require('class-transformer'), 'plainToClass')
        .mockReturnValue(mockFinalSolicitacao);

      const result = await service.create(
        mockCreateSolicitacaoDto,
        0,
        mockUserPayload,
      );

      // Verificar se a criação básica ainda acontece
      expect(prismaService.solicitacao.create).toHaveBeenCalled();

      // Verificar se o SMS NÃO foi enviado
      expect(smsService.sendSms).not.toHaveBeenCalled();

      // Verificar o resultado
      expect(result).toEqual(mockFinalSolicitacao);
    });

    it('should throw HttpException when there is an error', async () => {
      // Mock prisma para lançar um erro
      jest
        .spyOn(prismaService.solicitacao, 'findMany')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service.create(mockCreateSolicitacaoDto, 1, mockUserPayload),
      ).rejects.toThrow(HttpException);
    });

    it('should handle case with no related solicitacoes', async () => {
      // Mock para não encontrar relacionamentos
      jest
        .spyOn(prismaService.solicitacao, 'findMany')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(require('class-transformer'), 'plainToClass')
        .mockReturnValue(mockFinalSolicitacao);

      const result = await service.create(
        mockCreateSolicitacaoDto,
        1,
        mockUserPayload,
      );

      // Verificar se solicitacaoRelacionamento.create não foi chamado
      expect(
        prismaService.solicitacaoRelacionamento.create,
      ).not.toHaveBeenCalled();

      // O resto da função ainda deve funcionar
      expect(result).toEqual(mockFinalSolicitacao);
    });

    it('should handle failure in SMS sending', async () => {
      // Mock para falha no envio de SMS
      jest
        .spyOn(smsService, 'sendSms')
        .mockResolvedValueOnce({ status: 400 }) // Primeiro SMS para telefone falha
        .mockResolvedValueOnce({ status: 200 }) // Primeiro SMS para telefone2
        .mockResolvedValueOnce({ status: 200 }); // Segundo SMS para telefone2

      jest
        .spyOn(require('class-transformer'), 'plainToClass')
        .mockReturnValue(mockFinalSolicitacao);

      const result = await service.create(
        mockCreateSolicitacaoDto,
        1,
        mockUserPayload,
      );

      // O primeiro SMS deve ser enviado para telefone
      expect(smsService.sendSms).toHaveBeenCalledWith(
        expect.any(String),
        mockCreateSolicitacaoDto.telefone,
      );

      // O SMS de termos não deve ser enviado para telefone devido à falha do primeiro SMS,
      // mas os SMS para telefone2 devem ser enviados normalmente (são mais 2 chamadas)
      expect(smsService.sendSms).toHaveBeenCalledTimes(3);

      // O resto da função deve funcionar normalmente
      expect(result).toEqual(mockFinalSolicitacao);
    });
  });

  describe('findAll', () => {
    const mockFilterDto: filterSolicitacaoDto = {
      nome: 'Solicitação',
      id: null,
      andamento: null,
      construtora: null,
      empreendimento: null,
      financeiro: null,
    };

    const mockPaginationResult = {
      total: 2,
      pagina: 1,
      limite: 20,
      registros: mockSolicitacaoList,
    };
    beforeEach(() => {
      // Mock plainToClass
      jest
        .spyOn(require('class-transformer'), 'plainToClass')
        .mockReturnValue(mockPaginationResult);
    });

    it('should apply correct filters when USER role is provided', async () => {
      const userPayload = { ...mockUserPayload, hierarquia: 'USER' };
      const pagina = 1;
      const limite = 20;

      await service.findAll(pagina, limite, mockFilterDto, userPayload);

      // Verificar os filtros aplicados para USER
      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('corretor', userPayload.id);
      expect(callArgs.where).toHaveProperty('ativo', true);
      expect(callArgs.where).toHaveProperty('distrato', false);
    });

    it('should apply correct filters when CONST role is provided', async () => {
      const userPayload = { ...mockUserPayload, hierarquia: 'CONST' };
      const pagina = 1;
      const limite = 20;

      await service.findAll(pagina, limite, mockFilterDto, userPayload);

      // Verificar os filtros aplicados para CONST
      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('construtoras');
      expect(callArgs.where.construtoras.some.id.in).toEqual(
        userPayload.construtora,
      );
    });

    it('should apply additional filters when provided', async () => {
      const filterDto = {
        ...mockFilterDto,
        nome: 'Test',
        construtora: 2,
        empreendimento: 3,
        financeiro: 4,
        andamento: 'Finalizado',
      };

      await service.findAll(1, 20, filterDto, mockUserPayload);

      // Verificar os filtros adicionais
      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('nome');
      expect(callArgs.where.nome).toHaveProperty('contains', 'Test');
      expect(callArgs.where).toHaveProperty('construtoras');
      expect(callArgs.where).toHaveProperty('empreendimentos');
      expect(callArgs.where).toHaveProperty('financeiros');
      expect(callArgs.where).toHaveProperty('andamento');
    });

    it('should adjust limit when andamento filter is provided', async () => {
      const filterDto = { ...mockFilterDto, andamento: 'Finalizado' };

      await service.findAll(1, 20, filterDto, mockUserPayload);

      // Verificar se o limite foi ajustado para 50
      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.take).toBe(50);
    });

    it('should throw HttpException when there is an error', async () => {
      // Mock prisma para lançar um erro
      countMock.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service.findAll(1, 20, mockFilterDto, mockUserPayload),
      ).rejects.toThrow(HttpException);
    });
  });

  // ========== FIND ONE ==========
  describe('findOne', () => {
    beforeEach(() => {
      // Mock plainToClass
      jest
        .spyOn(require('class-transformer'), 'plainToClass')
        .mockReturnValue(mockSolicitacaoDetail);
    });

    it('should return a solicitacao by id (success case)', async () => {
      const id = 1;

      const result = await service.findOne(id, mockUserPayload);

      // Verificar se prisma foi chamado para buscar solicitação
      expect(findFirstMock).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: id,
        }),
        include: expect.objectContaining({
          corretor: true,
          construtora: true,
          empreendimento: true,
          financeiro: true,
          alerts: true,
          relacionamentos: true,
          tags: true,
          chamados: true,
          Logs: true,
        }),
      });

      // Verificar o resultado
      expect(result).toEqual(mockSolicitacaoDetail);
    });

    it('should apply correct filters when USER role is provided', async () => {
      const userPayload = {
        ...mockUserPayload,
        hierarquia: 'USER',
        id: 2,
      };
      const id = 1;

      await service.findOne(id, userPayload);

      // Verificar os filtros aplicados para USER
      const callArgs = findFirstMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('ativo', true);
      expect(callArgs.where).toHaveProperty('financeiroId');
      expect(callArgs.where).toHaveProperty('OR');
      expect(callArgs.where.OR).toEqual([
        { corretorId: userPayload.id },
        { corretorId: null },
      ]);
    });

    it('should apply correct filters when CONST role is provided', async () => {
      const userPayload = {
        ...mockUserPayload,
        hierarquia: 'CONST',
      };
      const id = 1;

      await service.findOne(id, userPayload);

      // Verificar os filtros aplicados para CONST
      const callArgs = findFirstMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('financeiroId');
      expect(callArgs.where.financeiroId.in).toEqual(userPayload.Financeira);
    });

    it('should apply correct filters when GRT role is provided', async () => {
      const userPayload = {
        ...mockUserPayload,
        hierarquia: 'GRT',
      };
      const id = 1;

      await service.findOne(id, userPayload);

      // Verificar os filtros aplicados para GRT
      const callArgs = findFirstMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('financeiroId');
      expect(callArgs.where.financeiroId.in).toEqual(userPayload.Financeira);
    });

    it('should apply correct filters when CCA role is provided', async () => {
      const userPayload = {
        ...mockUserPayload,
        hierarquia: 'CCA',
      };
      const id = 1;

      await service.findOne(id, userPayload);

      // Verificar os filtros aplicados para CCA
      const callArgs = findFirstMock.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('financeiroId');
      expect(callArgs.where.financeiroId.in).toEqual(userPayload.Financeira);
    });

    it('should throw HttpException when there is an error', async () => {
      // Mock prisma para lançar um erro
      findFirstMock.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findOne(1, mockUserPayload)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateAtivo', () => {
    it('should update a solicitacao with relacionamentos', async () => {
      const result = await service.update(1, updateSolicitacaoDto, {
        id: 1,
        nome: 'John Doe',
        construtora: [1],
        empreendimento: [1],
        hierarquia: 'ADMIN',
        Financeira: [1],
      });

      expect(findManyMock).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalled();
      expect(
        prismaService.solicitacaoRelacionamento.deleteMany,
      ).toHaveBeenCalled();
      expect(
        prismaService.solicitacaoRelacionamento.create,
      ).toHaveBeenCalledTimes(2);
      expect(logsService.Post).toHaveBeenCalled();

      expect(result).toMatchObject({
        id: 1,
        nome: expect.any(String),
        cpf: expect.any(String),
        email: expect.any(String),
        telefone: expect.any(String),
        corretor: expect.objectContaining({ id: 1 }),
        financeiro: expect.objectContaining({ id: 1 }),
        construtora: expect.objectContaining({ id: 1 }),
        empreendimento: expect.objectContaining({ id: 1 }),
        relacionamentos: expect.any(Array),
        alerts: expect.any(Array),
        chamados: expect.any(Array),
        tags: expect.any(Array),
        Logs: expect.any(Array),
      });
    });

    it('should update a solicitacao without relacionamentos', async () => {
      findManyMock.mockResolvedValueOnce([]);

      const result = await service.update(1, updateSolicitacaoDto, {
        id: 1,
        nome: 'John Doe',
        construtora: [1],
        empreendimento: [1],
        hierarquia: 'ADMIN',
        Financeira: [1],
      });

      expect(
        prismaService.solicitacaoRelacionamento.deleteMany,
      ).not.toHaveBeenCalled();
      expect(
        prismaService.solicitacaoRelacionamento.create,
      ).not.toHaveBeenCalled();

      expect(result).toMatchObject({
        id: 1,
        nome: expect.any(String),
        cpf: expect.any(String),
        email: expect.any(String),
        telefone: expect.any(String),
        corretor: expect.objectContaining({ id: 1 }),
        financeiro: expect.objectContaining({ id: 1 }),
        construtora: expect.objectContaining({ id: 1 }),
        empreendimento: expect.objectContaining({ id: 1 }),
        relacionamentos: expect.any(Array),
        alerts: expect.any(Array),
        chamados: expect.any(Array),
        tags: expect.any(Array),
        Logs: expect.any(Array),
      });
    });

    it('should throw HttpException on error', async () => {
      findManyMock.mockRejectedValueOnce(new Error('Erro'));

      await expect(
        service.update(1, updateSolicitacaoDto, {
          id: 1,
          nome: 'John Doe',
          construtora: [1],
          empreendimento: [1],
          hierarquia: 'ADMIN',
          Financeira: [1],
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('Atendimento', () => {
    it('should toggle statusAtendimento from false to true and log the action', async () => {
      // Simula status atual como `false`
      const mockFindUnique = jest
        .spyOn(prismaService.solicitacao, 'findUnique')
        .mockResolvedValueOnce({ statusAtendimento: false } as any);

      const mockUpdate = jest
        .spyOn(prismaService.solicitacao, 'update')
        .mockResolvedValueOnce({ statusAtendimento: true } as any);

      const mockLog = jest.spyOn(logsService, 'Post');

      const result = await service.Atendimento(1, mockUserPayload);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { statusAtendimento: true },
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { statusAtendimento: true },
      });

      expect(mockLog).toHaveBeenCalledWith({
        User: mockUserPayload.id,
        EffectId: 1,
        Rota: 'solicitacao',
        Descricao: expect.stringContaining('iniciou o atendimento'),
      });

      expect(result).toBe(true);
    });

    it('should toggle statusAtendimento from true to false and log the action', async () => {
      jest
        .spyOn(prismaService.solicitacao, 'findUnique')
        .mockResolvedValueOnce({ statusAtendimento: true } as any);
      jest
        .spyOn(prismaService.solicitacao, 'update')
        .mockResolvedValueOnce({ statusAtendimento: false } as any);
      const mockLog = jest.spyOn(logsService, 'Post');

      const result = await service.Atendimento(1, mockUserPayload);

      expect(prismaService.solicitacao.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { statusAtendimento: false },
      });

      expect(mockLog).toHaveBeenCalledWith({
        User: mockUserPayload.id,
        EffectId: 1,
        Rota: 'solicitacao',
        Descricao: expect.stringContaining('cancelou o atendimento'),
      });

      expect(result).toBe(false);
    });

    it('should throw HttpException on unexpected error', async () => {
      jest
        .spyOn(prismaService.solicitacao, 'findUnique')
        .mockRejectedValueOnce(new Error('Erro inesperado'));

      await expect(service.Atendimento(1, mockUserPayload)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('PostTags', () => {
    const mockUser = {
      id: 1,
      nome: 'John Doe',
      hierarquia: 'ADM',
    };

    const mockData = {
      solicitacao: 1,
      tags: [{ label: 'Importante' }, { label: 'Urgente' }],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create new tags and post a log', async () => {
      // Simula que nenhuma tag existe ainda
      jest
        .spyOn(prismaService.tag, 'findFirst')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      const createSpy = jest
        .spyOn(prismaService.tag, 'create')
        .mockResolvedValue({} as any);
      const logSpy = jest
        .spyOn(logsService, 'Post')
        .mockResolvedValue({} as any);

      const result = await service.PostTags(mockData, mockUser);

      expect(prismaService.tag.findFirst).toHaveBeenCalledTimes(2);
      expect(createSpy).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'tag adicionada com susseso' });
    });

    it('should not create tag if it already exists', async () => {
      // Simula que a primeira tag já existe
      jest
        .spyOn(prismaService.tag, 'findFirst')
        .mockResolvedValueOnce({ descricao: 'Importante' } as any)
        .mockResolvedValueOnce(null);

      const createSpy = jest
        .spyOn(prismaService.tag, 'create')
        .mockResolvedValue({} as any);

      const result = await service.PostTags(mockData, mockUser);

      expect(createSpy).toHaveBeenCalledTimes(1); // só a segunda é criada
      expect(result).toEqual({ message: 'tag adicionada com susseso' });
    });

    it('should skip creation if user is not ADM', async () => {
      const userNotADM = { ...mockUser, hierarquia: 'USER' };
      const createSpy = jest.spyOn(prismaService.tag, 'create');
      const result = await service.PostTags(mockData, userNotADM);

      expect(createSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'tag adicionada com susseso' });
    });

    it('should throw HttpException on error', async () => {
      jest
        .spyOn(prismaService.tag, 'findFirst')
        .mockRejectedValue(new Error('DB Error'));

      await expect(service.PostTags(mockData, mockUser)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('pause', () => {
    const mockUser = {
      id: 1,
      nome: 'John Doe',
      hierarquia: 'ADM',
      construtora: [1],
      empreendimento: [1],
      Financeira: [1],
    };

    const pauseRequest = { pause: true };
    const resumeRequest = { pause: false };

    const baseSolicitacaoData = {
      id: 1,
      nome: 'Solicitação 1',
      pause: true,
      statusAtendimento: false,
      corretor: { id: 1, nome: 'John Doe' },
      construtora: { id: 1, fantasia: 'Construtora 1' },
      empreendimento: { id: 1, nome: 'Empreendimento 1' },
      financeiro: { id: 1, fantasia: 'Financeiro 1' },
      alerts: [],
      relacionamentos: [],
      tags: [],
      chamados: [],
      Logs: [],
    };

    it('should pause a solicitacao successfully', async () => {
      const mockedResponse = plainToClass(SolicitacaoEntity, {
        ...baseSolicitacaoData,
        pause: true,
        statusAtendimento: false,
      });

      jest
        .spyOn(prismaService.solicitacao, 'update')
        .mockResolvedValueOnce(mockedResponse as any);
      jest.spyOn(logsService, 'Post').mockResolvedValueOnce({} as any);

      const result = await service.pause(pauseRequest, 1, mockUser);

      expect(logsService.Post).toHaveBeenCalledWith(
        expect.objectContaining({
          User: mockUser.id,
          EffectId: 1,
          Descricao: expect.stringContaining('pausou'),
        }),
      );
      expect(result).toBeInstanceOf(SolicitacaoEntity);
      expect(result.pause).toBe(true);
      expect(result.statusAtendimento).toBe(false);
    });

    it('should resume a solicitacao successfully', async () => {
      const mockedResponse = plainToClass(SolicitacaoEntity, {
        ...baseSolicitacaoData,
        pause: false,
        statusAtendimento: true,
      });

      jest
        .spyOn(prismaService.solicitacao, 'update')
        .mockResolvedValueOnce(mockedResponse as any);
      jest.spyOn(logsService, 'Post').mockResolvedValueOnce({} as any);

      const result = await service.pause(resumeRequest, 1, mockUser);

      expect(logsService.Post).toHaveBeenCalledWith(
        expect.objectContaining({
          User: mockUser.id,
          EffectId: 1,
          Descricao: expect.stringContaining('retomou'),
        }),
      );
      expect(result).toBeInstanceOf(SolicitacaoEntity);
      expect(result.pause).toBe(false);
      expect(result.statusAtendimento).toBe(true);
    });

    it('should throw HttpException on error', async () => {
      jest
        .spyOn(prismaService.solicitacao, 'update')
        .mockRejectedValueOnce(new Error('Erro'));

      await expect(service.pause(pauseRequest, 1, mockUser)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
