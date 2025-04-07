import { Test, TestingModule } from '@nestjs/testing';
import { ChamadoController } from './chamado.controller';
import { ChamadoService } from './chamado.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';



const mockChamado: CreateChamadoDto = {
  solicitacao: 0,
  descricao: '',
  status: 0
}

const userPayload = {
  id: 1,
  nome: 'John Doe',
  email: 'L2FVh@example.com',
}

const mockChamados = [
  {
    id: 1,
    solicitacao: 0,
    descricao: '',
    status: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    solicitacao: 0,
    descricao: '',
    status: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockChamadoUpdate: UpdateChamadoDto = {
  solicitacao: 0,
  descricao: '',
  status: 0,
}

describe('ChamadoController', () => {
  let controller: ChamadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChamadoController],
      providers: [
        {
          provide: ChamadoService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockChamado),
            findAll: jest.fn().mockResolvedValue(mockChamados),
            findOne: jest.fn().mockResolvedValue(mockChamado[0]),
            update: jest.fn().mockResolvedValue(mockChamadoUpdate),
            remove: jest.fn(),
          },
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

    controller = module.get<ChamadoController>(ChamadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new chamado', async () => {
      const result = await controller.create(mockChamado, userPayload);
      expect(result).toEqual(mockChamado);
    })
    it('should fail to create a new chamado', async () => {
      jest.spyOn(controller, 'create').mockRejectedValue(new Error('Error creating chamado'));
      await expect(controller.create(mockChamado, userPayload)).rejects.toThrowError('Error creating chamado');
    })
  })

  describe('findAll', () => {
    it('should return a list of chamados', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockChamados);
    })
    it('should fail to return a list of chamados', async () => {
      jest.spyOn(controller, 'findAll').mockRejectedValue(new Error('Error getting chamados'));
      await expect(controller.findAll()).rejects.toThrowError('Error getting chamados');
    })
  })

  describe('findOne', () => {
    it('should return a single chamado', async () => {
      const id = 1;
      const result = await controller.findOne((id-1).toString());
      expect(result).toEqual(mockChamado[0]);
    })
    it('should fail to return a single chamado', async () => {
      jest.spyOn(controller, 'findOne').mockRejectedValue(new Error('Error getting chamado'));
      await expect(controller.findOne('1')).rejects.toThrowError('Error getting chamado');
    })
  })

  describe('update', () => {
    it('should update a chamado', async () => {
      const id = 1;
      const result = await controller.update(id.toString(), mockChamadoUpdate, userPayload);
      expect(result).toEqual(mockChamadoUpdate);
    })
    it('should fail to update a chamado', async () => {
      jest.spyOn(controller, 'update').mockRejectedValue(new Error('Error updating chamado'));
      await expect(controller.update('1', mockChamadoUpdate, userPayload)).rejects.toThrowError('Error updating chamado');
    })
  })

  describe('remove', () => {
    it('should remove a chamado', async () => {
      const id = 1;
      const result = await controller.remove(id.toString(), userPayload);
      console.log(result);
      expect(result).toBeUndefined();
    })
    it('should fail to remove a chamado', async () => {
      jest.spyOn(controller, 'remove').mockRejectedValue(new Error('Error removing chamado'));
      await expect(controller.remove('1', userPayload)).rejects.toThrowError('Error removing chamado');
    })
    
  })

});



