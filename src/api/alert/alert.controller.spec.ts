import { Test, TestingModule } from '@nestjs/testing';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { LogService } from '../../log/log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../../sms/sms.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../../auth/auth.guard';
import { CanActivate } from '@nestjs/common';


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
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            GetSolicitacaoAlerta: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
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

  
});
