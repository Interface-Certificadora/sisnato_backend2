import { Test, TestingModule } from '@nestjs/testing';
import { AlertService } from './alert.service';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UserPayload } from '../../auth/entities/user.entity';

describe('AlertService', () => {
  let service: AlertService;
  let logService: LogService;
  let prisma: PrismaService;
  let smsService: SmsService;

  const UserAdm: UserPayload = {
      id: 1,
      nome: 'Teste',
      construtora: [],
      empreendimento: [],
      hierarquia: 'ADM',
      Financeira: []
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        {
          provide: LogService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        PrismaService,
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
    }).compile();

    service = module.get<AlertService>(AlertService);
    logService = module.get<LogService>(LogService);
    prisma = module.get<PrismaService>(PrismaService);
    smsService = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(logService).toBeDefined();
    expect(prisma).toBeDefined();
    expect(smsService).toBeDefined();
  });

  it('should create an alert', async () => {
    const alert: CreateAlertDto = {
      texto: 'Alerta de teste',
      titulo: 'Alerta de teste',
      solicitacao_id: 1,
      corretor: 1,
      tipo: 'CORRETOR',
      tag: 'warning',
      empreendimento: 1,
      status: true,
    };

    const result = await service.create(alert, UserAdm);
    console.log("🚀 ~ it ~ result:", result)
    // expect(result).toBeDefined();
  });

});
