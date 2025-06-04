import { Test, TestingModule } from '@nestjs/testing';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../auth/auth.guard';
import { CanActivate } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

const listamockfind = [
  { id: 1, message: 'Alerta 1', createdAt: new Date() },
  { id: 2, message: 'Alerta 2', createdAt: new Date() },
  { id: 3, message: 'Alerta 3', createdAt: new Date() },
];

const mockAlert = {
  id: 1,
  texto: 'Alerta de teste',
  titulo: 'Alerta de teste',
  solicitacao_id: 1,
  corretor: 1,
  tipo: 'CORRETOR',
  tag: 'warning',
  empreendimento: 1,
  status: true,
  createdAt: new Date(),
};

const UserPayload = {
  id: 1,
  nome: 'Teste',
  construtora: [1],
  empreendimento: [1],
  hierarquia: 'USER',
  Financeira: [1],
};
describe('AlertController', () => {
  let alertController: AlertController;
  let alertService: AlertService;
  let logService: LogService;
  let prisma: PrismaService;
  let smsService: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertController],
      providers: [
        {
          provide: AlertService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAlert),
            findAll: jest.fn().mockResolvedValue(listamockfind),
            findOne: jest.fn(),
            GetSolicitacaoAlerta: jest.fn(),
            update: jest
              .fn()
              .mockImplementation((id, dto) => Promise.resolve({ ...dto, id })),
            remove: jest.fn().mockResolvedValue('Alerta removido'),
          },
        },
        {
          provide: LogService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: SmsService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
            verify: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) } as CanActivate)
      .compile();

    alertController = module.get<AlertController>(AlertController);
    alertService = module.get<AlertService>(AlertService);
    logService = module.get<LogService>(LogService);
    prisma = module.get<PrismaService>(PrismaService);
    smsService = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(alertController).toBeDefined();
    expect(alertService).toBeDefined();
    expect(logService).toBeDefined();
    expect(prisma).toBeDefined();
    expect(smsService).toBeDefined();
  });

  describe('FindAll', () => {
    it('deve retornar a lista de alertas', async () => {
      const result = await alertController.findAll(84848484844);
      expect(result).toEqual(listamockfind);
    });
  });

  describe('FindOne', () => {
    it('deve retornar uma lista de alertas filtrada pelo corretor', async () => {
      const mockId = 1;
      const mockAlerts = listamockfind.filter((alert) => alert.id === mockId);

      (alertService.findOne as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await alertController.findOne(mockId.toString());

      expect(alertService.findOne).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockAlerts);
    });

    describe('create', () => {
      it('deve criar um alerta e retornar o resultado', async () => {
        const alertDto: CreateAlertDto = {
          descricao: 'Alerta de teste',
          titulo: 'Alerta de teste',
          solicitacao_id: 1,
          corretor: 1,
          tag: 'warning',
          empreendimento: 1,
          status: true,
        };

        const result = await alertController.create(alertDto, UserPayload);
        expect(result).toEqual(mockAlert);
      });
    });

    describe('remove', () => {
      it('deve remover um alerta e retornar a mensagem de sucesso', async () => {
        const mockId = 1;
        const result = await alertController.remove(
          mockId.toString(),
          UserPayload,
        );

        expect(result).toEqual('Alerta removido');
      });
    });

    describe('update', () => {
      it('deve atualizar um alerta e retornar o resultado atualizado', async () => {
        const mockId = 1;
        const alertDto: UpdateAlertDto = {
          descricao: 'new alerta de teste',
          titulo: 'new alerta de teste',
          solicitacao_id: 1,
          corretor: 1,
          tag: 'warning',
          empreendimento: 1,
          status: true,
          texto: '',
          tipo: '',
        };

        const expectedResult = { ...alertDto, id: mockId };
        (alertService.update as jest.Mock).mockResolvedValue(expectedResult);
        const result = await alertController.update(
          mockId.toString(),
          alertDto,
          UserPayload,
        );
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
