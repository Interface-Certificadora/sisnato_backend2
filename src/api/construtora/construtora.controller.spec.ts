import { Test, TestingModule } from '@nestjs/testing';
import { ConstrutoraController } from './construtora.controller';
import { ConstrutoraService } from './construtora.service';
import { JwtService } from '@nestjs/jwt';
import { CreateConstrutoraDto } from './dto/create-construtora.dto';
import { Construtora } from './entities/construtora.entity';


const construtoraslist: CreateConstrutoraDto[] = [
  {
    cnpj: '00000000000100',
    razaosocial: 'Construtora A',
    fantasia: 'Construtora A',
    tel: '0000000000',
    email: '0dMgM@example.com',
  },
  {
    cnpj: '00000000000200',
    razaosocial: 'Construtora B',
    fantasia: 'Construtora B',
    tel: '0000000000',
    email: '0dMgM@example.com',
  },
  {
    cnpj: '00000000000300',
    razaosocial: 'Construtora C',
    fantasia: 'Construtora C',
    tel: '0000000000',
    email: '0dMgM@example.com',
  }
]


const jwt = "fake-jwt-token";

const mockedConstrutora: CreateConstrutoraDto = {
  cnpj: '00000000000100',
  razaosocial: 'Construtora A',
  fantasia: 'Construtora A',
  tel: '0000000000',
  email: '0dMgM@example.com',
}

describe('ConstrutoraController', () => {
  let construtoracontroller: ConstrutoraController;
  let construtoraService: ConstrutoraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstrutoraController],
      providers: [
        {
          provide: ConstrutoraService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockedConstrutora),
            findAll: jest.fn().mockResolvedValue(construtoraslist),
            findOne: jest.fn().mockResolvedValue(mockedConstrutora),
            update: jest.fn().mockResolvedValue(mockedConstrutora),
            remove: jest.fn().mockResolvedValue(mockedConstrutora),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
            verify: jest.fn().mockReturnValue({ userId: 1 }),
          },
        }
      ],
    }).compile();

    construtoracontroller = module.get<ConstrutoraController>(ConstrutoraController);
    construtoraService = module.get<ConstrutoraService>(ConstrutoraService);
  });

  it('should be defined', () => {
    expect(construtoracontroller).toBeDefined();
    expect(construtoraService).toBeDefined();
  });


  describe('create', () => {
    it('should create a construtora', async () => {
      const result = await construtoracontroller.create(mockedConstrutora, 'fake-jwt-token');
      expect(result).toEqual(mockedConstrutora);
    });
  })

  describe('findAll', () => {
    it('should return an array of construtoras', async () => {
      const result = await construtoracontroller.findAll();
      expect(result).toEqual(construtoraslist);
    })
  })
  
  describe('findOne', () => {
    it('should return a construtora', async () => {

      const id = 1;
      const result = await construtoracontroller.findOne(id.toString());
      expect(result).toEqual(construtoraslist[0]);  
    })

    it('should throw an error if the construtora is not found', async () => {
      const id = 1;
      jest.spyOn(construtoraService, 'findOne').mockRejectedValueOnce(new Error('Construtora not found'));
      await expect(construtoracontroller.findOne(id.toString())).rejects.toThrow();
    });
    
  })

  describe('update', () => {
    it('should update a construtora', async () => {
      const id = 1;
      const response = await construtoracontroller.update(id.toString(), mockedConstrutora, jwt);
      expect(response).toEqual(mockedConstrutora);
    })

    it('should throw an error if the construtora is not found', async () => {
      const id = 1;
      
      jest.spyOn(construtoraService, 'update').mockRejectedValueOnce(new Error('Construtora not found'));
      await expect(construtoracontroller.update(id.toString(), mockedConstrutora, jwt)).rejects.toThrow();
    });
  })

  describe('remove', () => {
    it('should remove a construtora', async () => {
      const id = 1;
      const response = await construtoracontroller.remove(id.toString(), jwt);
      expect(response).toEqual(mockedConstrutora);
    })

    it('should throw an error if the construtora is not found', async () => {
      const id = 1;
      jest.spyOn(construtoraService, 'remove').mockRejectedValueOnce(new Error('Construtora not found'));
      await expect(construtoracontroller.remove(id.toString(), jwt)).rejects.toThrow();
    }); 
  })
});
