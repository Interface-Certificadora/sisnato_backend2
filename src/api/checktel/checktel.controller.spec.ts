import { Test, TestingModule } from '@nestjs/testing';
import { ChecktelController } from './checktel.controller';
import { ChecktelService } from './checktel.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

describe('ChecktelController', () => {
  let controller: ChecktelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecktelController],
      providers: [
        {
          provide: ChecktelService,
          useValue: {
            getTell: jest.fn(),
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
            verify: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        }
      ],
    }).compile();

    controller = module.get<ChecktelController>(ChecktelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get tell', async () => {
    const result = await controller.getTell('1684684864684');
    expect(result).toBeUndefined();
  });
});
