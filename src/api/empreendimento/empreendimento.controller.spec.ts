import { Test, TestingModule } from '@nestjs/testing';
import { EmpreendimentoController } from './empreendimento.controller';
import { EmpreendimentoService } from './empreendimento.service';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { error } from 'console';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';
import { Empreendimento } from '@prisma/client';


let id = null;

const EmpreendimentoEntity: Empreendimento = {
  id: 0,
  nome: '',
  construtoraId: 0,
  estado: '',
  cidade: '',
  status: false,
  descricao: '',
  endereco: '',
  cep: '',
  obs: '',
  tag: '',
  responsavelId: 0,
  createdAt: undefined,
  updatedAt: undefined
}

const empreendimentolist = [EmpreendimentoEntity, EmpreendimentoEntity, EmpreendimentoEntity];

const updateEmpreendimentoDto : UpdateEmpreendimentoDto = {
  construtoraId: 0,
  nome: '',
  cidade: '',
  estado: ''
}

const empreendimento : CreateEmpreendimentoDto = {
  nome: '',
  construtoraId: 0,
  estado: '',
  cidade: '',
  status: false
}

const UserPayload = {
  id: 0,
  nome: '',
  email: '',
  hierarquia: ''
}

const list = [
  {
    id: 0,
    nome: '',
    construtoraId: 0,
    estado: '',
    cidade: '',
    status: false
  },
  {
    id: 1,
    nome: '',
    construtoraId: 0,
    estado: '',
    cidade: '',
    status: false
  },
  {
    id: 2,
    nome: '',
    construtoraId: 0,
    estado: '',
    cidade: '',
    status: false
  }
]

describe('EmpreendimentoController', () => {
  let controller: EmpreendimentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpreendimentoController],
      providers: [
        {
          provide: EmpreendimentoService,
          useValue: {
            create: jest.fn().mockResolvedValue(empreendimento),
            findAll: jest.fn().mockResolvedValue(list),
            findOne: jest.fn().mockResolvedValue(list[id-1]),
            update: jest.fn().mockResolvedValue(updateEmpreendimentoDto),
            remove: jest.fn(),
            GetAllSearch: jest.fn().mockResolvedValue(empreendimentolist),
            GetByConstrutora: jest.fn().mockResolvedValue(EmpreendimentoEntity),
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
          useValue: {}
        }
      ],
    }).compile();

    controller = module.get<EmpreendimentoController>(EmpreendimentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new empreendimento', async () => {
      const result = await controller.create(empreendimento, UserPayload);
      expect(result).toEqual(empreendimento);
    })
    it('should fail to create a new empreendimento', async () => {
      jest.spyOn(controller, 'create').mockRejectedValue(error);
      await expect(controller.create(empreendimento, UserPayload)).rejects.toEqual(error);
    });
  })

  describe('findAll', () => {
    it('should return a list of empreendimentos', async () => {
      const result = await controller.findAll(UserPayload);
      expect(result).toEqual(list);
    })
    it('should fail to return a list of empreendimentos', async () => {
      jest.spyOn(controller, 'findAll').mockRejectedValue(error);
      await expect(controller.findAll(UserPayload)).rejects.toEqual(error);
    });
  })

  describe('findOne', () => {
    const id = 1;
  
    beforeEach(() => {
      controller.findOne = jest.fn().mockResolvedValue(list[id - 1]);
    });
  
    it('should return a empreendimento', async () => {
      const result = await controller.findOne(id.toString());
      expect(result).toEqual(list[id - 1]);
    });
  
    it('should fail to return a empreendimento', async () => {
      jest.spyOn(controller, 'findOne').mockRejectedValue(error);
      await expect(controller.findOne(id.toString())).rejects.toEqual(error);
    });
  });

  describe('update', () => {
    it('should update a empreendimento', async () => {
      const result = await controller.update(id, updateEmpreendimentoDto, UserPayload);
      expect(result).toEqual(updateEmpreendimentoDto);
    })
    it('should fail to update a empreendimento', async () => {
      jest.spyOn(controller, 'update').mockRejectedValue(error);
      await expect(controller.update(id, updateEmpreendimentoDto, UserPayload)).rejects.toEqual(error);
    });
  })

  describe('remove', () => {
    it('should remove a empreendimento', async () => {
      const result = await controller.remove(id, UserPayload);
      expect(result).toBeUndefined();
    })
    it('should fail to remove a empreendimento', async () => {
      jest.spyOn(controller, 'remove').mockRejectedValue(error);
      await expect(controller.remove(id, UserPayload)).rejects.toEqual(error);
    });
  })

  describe('GetAllSearch', () => {
    it('should return a list of empreendimentos', async () => {
      const result = await controller.GetAllSearch(0,0 );
      expect(result).toEqual(empreendimentolist);
    })
    it('should fail to return a list of empreendimentos', async () => {
      jest.spyOn(controller, 'GetAllSearch').mockRejectedValue(error);
      await expect(controller.GetAllSearch(0,0)).rejects.toEqual(error);
    });
  })

  describe('GetByConstrutora', () => {
    it('should return a list of empreendimentos', async () => {
      const id = 1

      
      const result = await controller.GetByConstrutora(id.toString());
      expect(result).toEqual(empreendimentolist[id - 1]);
    })
    it('should fail to return a list of empreendimentos', async () => {
      jest.spyOn(controller, 'GetByConstrutora').mockRejectedValue(error);
      await expect(controller.GetByConstrutora(id)).rejects.toEqual(error);
    });
  })  
  
});
