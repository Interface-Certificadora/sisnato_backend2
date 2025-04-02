import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query.dto';


describe('UserController', () => {
  let usercontroller: UserController;
  let userservice: UserService;

  const querdto = {
    empreendimento: '1',
    financeiro: '1',
    construtora: '1',
    telefone: '1',
    email: '1',
    cpf: '1',
  } as QueryUserDto;

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
    hierarquia: 'ADMIN',
    Financeira:[3],
  } as CreateUserDto;
  
  const mockedlist = [
    {
      id: 1,
      nome: 'John Doe',
      username: 'johndoe',
      password: '123456',
      telefone: '123456789',
      email: 'johndoe@ex.com',
      cpf: '123456789',
      cargo: 'GERENTE',
      construtora:[1],
      empreendimento:[2],
      hierarquia: 'ADMIN',
      Financeira:[3],
    },
    {
      id: 2,
      nome: 'John Doe',
      username: 'johndoe',
      password: '123456',
      telefone: '123456789',
      email: 'johndoe@ex.com',
      cpf: '123456789',
      cargo: 'GERENTE',
      construtora:[1],
      empreendimento:[2],
      hierarquia: 'ADMIN',
      Financeira:[3],
    },
    {
      id: 3,
      nome: 'John Doe',
      username: 'johndoe',
      password: '123456',
      telefone: '123456789',
      email: 'johndoe@ex.com',
      cpf: '123456789',
      cargo: 'GERENTE',
      construtora:[1],
      empreendimento:[2],
      hierarquia: 'ADMIN',
      Financeira:[3], 
    }
  ];

  const mockUserService = {
    create: jest.fn().mockResolvedValue(createUserDto),
    findAll: jest.fn().mockResolvedValue(mockedlist),
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
  // Testes de criação de usuario
  it('should create a user', async () => {
    const result = await usercontroller.create(createUserDto);
  
    expect(result).toEqual(createUserDto);
    expect(userservice.create).toHaveBeenCalledWith(createUserDto);
  });
  //teste se o username ja existe
  it('should throw if username already exists', async () => {
    const error = {
      message: 'Username ja cadastrado',
    };
  
    mockUserService.create.mockRejectedValueOnce({
      response: error,
      status: 400,
    });
  
    await expect(usercontroller.create(createUserDto)).rejects.toMatchObject({
      response: error,
      status: 400,
    });
  
    expect(userservice.create).toHaveBeenCalledWith(createUserDto);
  });
  //teste se as senhas nao conferem
  it('should throw if passwords do not match', async () => {
    const wrongPasswordDto = {
      ...createUserDto,
      passwordConfir: '654321',
    };
  
    const error = {
      message: 'Senhas nao conferem',
    };
  
    mockUserService.create.mockRejectedValueOnce({
      response: error,
      status: 400,
    });
  
    await expect(usercontroller.create(wrongPasswordDto)).rejects.toMatchObject({
      response: error,
      status: 400,
    });
  
    expect(userservice.create).toHaveBeenCalledWith(wrongPasswordDto);
  });
  //teste de o cpf ja existir
  it('should throw if cpf already exists', async () => {
    const error = {
      message: 'Cpf ja cadastrado',
    };
  
    mockUserService.create.mockRejectedValueOnce({
      response: error,
      status: 400,
    });
  
    await expect(usercontroller.create(createUserDto)).rejects.toMatchObject({
      response: error,
      status: 400,
    });
  
    expect(userservice.create).toHaveBeenCalledWith(createUserDto);
  });
 //teste de o email ja existir
  it ('should throw if email already exists', async () => {
    const error = {
      message: 'Email ja cadastrado',
    };
  
    mockUserService.create.mockRejectedValueOnce({
      response: error,
      status: 400,
    });
  
    await expect(usercontroller.create(createUserDto)).rejects.toMatchObject({
      response: error,
      status: 400,
    });
  
    expect(userservice.create).toHaveBeenCalledWith(createUserDto);
  });

  // teste da função Findall
  it('should return an array of users', async () => {
    const result = await usercontroller.findAll();
  
    expect(result).toEqual(mockedlist);
    expect(userservice.findAll).toHaveBeenCalled();
  });

  //teste da função FindOne
  it('should return a user', async () => {
    const id = 1;
    const userMock = mockedlist[0];
  
    mockUserService.findOne.mockResolvedValueOnce(userMock); 
  
    const result = await usercontroller.findOne(id.toString());
  
    expect(result).toEqual(userMock);
    expect(userservice.findOne).toHaveBeenCalledWith(id);
  });

  //teste da função update
  it('should update a user', async () => {
    const id = 1;
    const userMock = mockedlist[0];
  
    mockUserService.update.mockResolvedValueOnce(userMock);
  
    const result = await usercontroller.update(id.toString(), userMock);
  
    expect(result).toEqual(userMock);
    expect(userservice.update).toHaveBeenCalledWith(id, userMock);
  });

  it('should return error if user not found', async () => {
    const id = 1;
    const error = {
      message: 'User not found',
    };
  
    mockUserService.update.mockRejectedValueOnce({
      response: error,
      status: 404,
    });
  
    await expect(usercontroller.update(id.toString(), {})).rejects.toMatchObject({
      response: error,
      status: 404,
    });
  
    expect(userservice.update).toHaveBeenCalledWith(id, {});
  });

  it('should return error if cpf already exists', async () => {
    const id = 1;
    const error = {
      message: 'Cpf ja cadastrado',
    };
  
    mockUserService.update.mockRejectedValueOnce({
      response: error,
      status: 400,
    });
  
    await expect(usercontroller.update(id.toString(), {})).rejects.toMatchObject({
      response: error,
      status: 400,
    });
  
    expect(userservice.update).toHaveBeenCalledWith(id, {});
  });

  it('primeAcess', async () => {
    const id = 1;
    const updateUserDto = {
      password: '123456',
    };
  
    mockUserService.primeAcess.mockResolvedValueOnce({});
  
    await usercontroller.resetPassword(updateUserDto, id.toString());
  
    expect(userservice.primeAcess).toHaveBeenCalledWith(id, updateUserDto);
  });

  it('should return search', async () => {

  
    mockUserService.search.mockResolvedValueOnce([]);
  
    await usercontroller.Busca(querdto);
  
    expect(userservice.search).toHaveBeenCalledWith(querdto);
  }); 

  it('should return userTermos', async () => {
    const id = 1;
  
    mockUserService.userTermos.mockResolvedValueOnce({});
  
    await usercontroller.userTermos(id.toString());
  
    expect(userservice.userTermos).toHaveBeenCalledWith(id);
  });

 /*  it('should return updateTermo', async () => {
    const id = 1;
  
    mockUserService.updateTermos.mockResolvedValueOnce({});
  
    await usercontroller.updateTermos(id.toString(), createUserDto);
  
    expect(userservice.updateTermo).toHaveBeenCalledWith(id, createUserDto);
  });   */

  it('should return remove', async () => {
    const id = 1;
  
    mockUserService.remove.mockResolvedValueOnce({});
  
    await usercontroller.remove(id);
  
    expect(userservice.remove).toHaveBeenCalledWith(id);
  });
});
