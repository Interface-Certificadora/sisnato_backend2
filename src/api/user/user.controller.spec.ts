import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
describe('UserController', () => {
  let usercontroller: UserController;
  let userservice: UserService;
  const createUserDto = {
    nome: 'John Doe',
    username: 'johndoe',
    password: '123456',
    passwordConfir: '123456',
    telefone: '123456789',  
    email: 'johndoe@ex.com',
    cpf: '123456789',
    cargo: 'GERENTE',
    construtora:[1],
    empreendimento:[2],
    Financeira:[3],
    hierarquia: 'ADMIN',
  };

  const mockUserService = {
    create: jest.fn().mockResolvedValue(createUserDto),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    primeAcess: jest.fn(),
    search: jest.fn(),
    userTermos: jest.fn(),
    updateTermos: jest.fn(),
    updatePassword: jest.fn(),
    remove: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
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

    usercontroller = module.get<UserController>(UserController);
    userservice = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usercontroller).toBeDefined();
    expect(userservice).toBeDefined();
  });

  it('should create a user', async () => {
    const result = await usercontroller.create(createUserDto);
  
    expect(result).toEqual(createUserDto);
    expect(userservice.create).toHaveBeenCalledWith(createUserDto);
  });
  
});
