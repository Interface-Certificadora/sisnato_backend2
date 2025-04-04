import { Test, TestingModule } from '@nestjs/testing';
import { ChamadoController } from './chamado.controller';
import { ChamadoService } from './chamado.service';

describe('ChamadoController', () => {
  let controller: ChamadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChamadoController],
      providers: [
        {
          provide: ChamadoService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        }
      ],
    }).compile();

    controller = module.get<ChamadoController>(ChamadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {

    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });
    
  })

  describe('findAll', () => {
    
  })

  describe('findOne', () => {
    
  })

  describe('update', () => {
    
  })

  describe('remove', () => {
    
  })

});



