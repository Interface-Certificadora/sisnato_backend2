import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { Construtora } from '../construtora/entities/construtora.entity';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';

const Userdata = {
  id: 1,
  username: 'johndoe',
  password: '123456',
  password_key: '123456',
  telefone: '123456789',
  email: 'johndoe@ex.com',
  cpf: '123456789',
  nome: 'John Doe',
  cargo: 'GERENTE',
  hierarquia: 'ADMIN',
  reset_password: false,
  status: true,
  sms_relat: false,
  termos: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User

const Construtoradata = {
  id: 1,
  cnpj: '123456789',
  razaosocial: 'Construtora 1',
  fantasia: 'Construtora 1',
  tel: '123456789',
  email: '0eZ3W@example.com',
  obs: 'Observação 1',
  status: true,
  valor_cert: 100,
  financeiroId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Construtora;

const mockSolicitacao: CreateSolicitacaoDto = {
  nome: 'Solicitação 1',
  email: 'exemplo@email.com',
  cpf: '12345678900',
  telefone: '11999999999',
  telefone2: '11988888888',
  dt_nascimento: new Date('1990-01-01'),
  id_fcw: 123,
  obs: 'Observação',
  cnh: '123456789',
  ativo: true,
  uploadRg: 'https://example.com/rg.jpg',
  uploadCnh: 'https://example.com/cnh.jpg', 
  rela_quest: true,
  distrato: true,
  dt_distrato: new Date(),
  status_aprovacao: true,
  distrato_id: 2,
  andamento: 'Andamento da solicitação',
  type_validacao: 'Validação',
  dt_aprovacao: new Date(),
  hr_aprovacao: '12:00',
  dt_agendamento: new Date(),
  hr_agendamento: '15:00',
  corretor: 1,
  construtora: 1,
  financeiro: 1,
  empreendimento: 1,
} as unknown as CreateSolicitacaoDto;



describe('SolicitacaoController', () => {
  let controller: SolicitacaoController;
  let service: SolicitacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitacaoController],
      providers: [
        {
          provide: SolicitacaoService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockSolicitacao),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn().mockResolvedValue(mockSolicitacao),
          },
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

    controller = module.get<SolicitacaoController>(SolicitacaoController);
    service = module.get<SolicitacaoService>(SolicitacaoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  

  
});
