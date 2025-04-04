import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacaoController } from './solicitacao.controller';
import { SolicitacaoService } from './solicitacao.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';

import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { QuerySolicitacaoDto } from './dto/query-solicitacao.dto';

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
} as User;

const mockquery: QuerySolicitacaoDto = {
  andamento: 'Andamento da solicitação',
  construtora: '1',
  empreendimento: '1',
  financeiro: '1',
  id: '1',
  limite: '10',
  nome: 'Solicitação 1',
  pagina: 1,
};

const solicitacaolist = [
  {
    id: 1,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    nome: 'Solicitação 2',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    nome: 'Solicitação 3',
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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


const mockSolicitacaoResponse = {
  ...mockSolicitacao,
  corretor: {
    id: 1,
    nome: 'Corretor 1',
    telefone: '11999999999',
  },
  financeiro: {
    id: 1,
    fantasia: 'Financeiro 1',
  },
  construtora: {
    id: 1,
    fantasia: 'Construtora 1',
  },
  empreendimento: {
    id: 1,
    nome: 'Empreendimento 1',
    cidade: 'São Paulo',
  },
};
const jwt = 'fake-jwt-token';
const sms = 'fake-sms-token';

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
            create: jest.fn().mockResolvedValue(mockSolicitacaoResponse),
            findAll: jest.fn().mockResolvedValue(solicitacaolist),
            findOne: jest.fn().mockResolvedValue(mockSolicitacao),
            update: jest.fn().mockResolvedValue(mockSolicitacao),
            remove: jest.fn(),
            resendSms: jest.fn(),
            updateAtivo: jest.fn(),
            Atendimento: jest.fn(),
            PostTags: jest.fn(),
            pause: jest.fn(),
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

  // ========== CREATE ==========
  describe('create', () => {
    it('should create a new Solicitacao (success case)', async () => {

      const result = await controller.create(mockSolicitacao, sms, jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.create).toHaveBeenCalledWith(mockSolicitacao, sms, jwt);
    });

   /*  it('should throw an error if create fails', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Error creating Solicitacao'));

      await expect(controller.create(mockSolicitacao, sms, jwt)).rejects.toThrow('Error creating Solicitacao');
      expect(service.create).toHaveBeenCalledWith(mockSolicitacao, sms, jwt);
    }); */
  });

  // ========== FIND ALL ==========
  /* describe('findAll', () => {
    it('should return an array of Solicitacao (success case)', async () => {
      const result = await controller.findAll(jwt, mockquery);
      expect(result).toEqual(solicitacaolist);
      expect(service.findAll).toHaveBeenCalledWith(mockquery, jwt);
    });

    it('should throw an error if findAll fails', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValueOnce(new Error('Error finding Solicitacao'));

      await expect(controller.findAll(jwt, mockquery)).rejects.toThrow('Error finding Solicitacao');
      expect(service.findAll).toHaveBeenCalledWith(mockquery, jwt);
    });
  });

  // ========== FIND ONE ==========
  describe('findOne', () => {
    it('should return a Solicitacao (success case)', async () => {
      const id = 1;
      const result = await controller.findOne(id, jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.findOne).toHaveBeenCalledWith(id, jwt);
    });

    it('should throw an error if findOne fails', async () => {
      const id = 1;
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new Error('Error finding one Solicitacao'));

      await expect(controller.findOne(id, jwt)).rejects.toThrow('Error finding one Solicitacao');
      expect(service.findOne).toHaveBeenCalledWith(id, jwt);
    });
  });

  // ========== UPDATE ==========
  describe('update', () => {
    it('should update a Solicitacao (success case)', async () => {
      const id = '1';

      const result = await controller.update(id, mockSolicitacao, jwt);
      expect(result).toEqual(mockSolicitacao);
      // Aqui assumindo que no service a função update recebe (id: number, dto: CreateSolicitacaoDto)
      expect(service.update).toHaveBeenCalledWith(Number(id), mockSolicitacao);
    });

    it('should throw an error if update fails', async () => {
      const id = '1';
      jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Error updating Solicitacao'));

      await expect(controller.update(id, mockSolicitacao, jwt)).rejects.toThrow('Error updating Solicitacao');
      expect(service.update).toHaveBeenCalledWith(Number(id), mockSolicitacao);
    });
  });

  // ========== REMOVE ==========
  describe('remove', () => {
    it('should remove a Solicitacao (success case)', async () => {
      const id = '1';
      // Supondo que remove retorne o objeto removido ou algo semelhante.
      jest.spyOn(service, 'remove').mockResolvedValueOnce(mockSolicitacao as any);

      const result = await controller.remove(id, jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.remove).toHaveBeenCalledWith(Number(id));
    });

    it('should throw an error if remove fails', async () => {
      const id = '1';
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new Error('Error removing Solicitacao'));

      await expect(controller.remove(id, jwt)).rejects.toThrow('Error removing Solicitacao');
      expect(service.remove).toHaveBeenCalledWith(Number(id));
    });
  });

  // ========== RESEND SMS ==========
  describe('resendSms', () => {
    it('should resend SMS (success case)', async () => {
      const id = '1';
      jest.spyOn(service, 'resendSms').mockResolvedValueOnce(mockSolicitacao as any);

      const result = await controller.Resend(+id, jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.resendSms).toHaveBeenCalledWith(Number(id));
    });

    it('should throw an error if resend fails', async () => {
      const id = '1';
      jest.spyOn(service, 'resendSms').mockRejectedValueOnce(new Error('Error resending SMS'));

      await expect(controller.Resend(+id, jwt)).rejects.toThrow('Error resending SMS');
      expect(service.resendSms).toHaveBeenCalledWith(Number(id));
    });
  }); */

  // ========== UPDATE ATIVO ==========
/*   describe('updateAtivo', () => {
    it('should update the "ativo" status of a Solicitacao (success case)', async () => {
      const id = '1';
      jest.spyOn(service, 'updateAtivo').mockResolvedValueOnce(mockSolicitacao as any);

      const result = await controller.updateAtivo(id);
      expect(result).toEqual(mockSolicitacao);
      expect(service.updateAtivo).toHaveBeenCalledWith(Number(id));
    });

    it('should throw an error if updateAtivo fails', async () => {
      const id = '1';
      jest.spyOn(service, 'updateAtivo').mockRejectedValueOnce(new Error('Error updating ativo'));

      await expect(controller.updateAtivo(id)).rejects.toThrow('Error updating ativo');
      expect(service.updateAtivo).toHaveBeenCalledWith(Number(id));
    });
  }); */

  // ========== ATENDIMENTO ==========
  /* describe('Atendimento', () => {
    it('should handle atendimento (success case)', async () => {
      const id = '1';
      jest.spyOn(service, 'Atendimento').mockResolvedValueOnce(mockSolicitacao as any);

      const result = await controller.Atendimento(+id, jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.Atendimento).toHaveBeenCalledWith(Number(id));
    });

    it('should throw an error if Atendimento fails', async () => {
      const id = '1';
      jest.spyOn(service, 'Atendimento').mockRejectedValueOnce(new Error('Error in Atendimento'));

      await expect(controller.Atendimento(+id, jwt)).rejects.toThrow('Error in Atendimento');
      expect(service.Atendimento).toHaveBeenCalledWith(Number(id));
    });
  });

  // ========== POST TAGS ==========
  describe('PostTags', () => {
    it('should post tags (success case)', async () => {
      const id = '1';
      jest.spyOn(service, 'PostTags').mockResolvedValueOnce(mockSolicitacao as any);

      const result = await controller.PostTags(+id, jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.PostTags).toHaveBeenCalledWith(Number(id));
    });

    it('should throw an error if PostTags fails', async () => {
      const id = '1';
      jest.spyOn(service, 'PostTags').mockRejectedValueOnce(new Error('Error in PostTags'));

      await expect(controller.PostTags(+id, jwt)).rejects.toThrow('Error in PostTags');
      expect(service.PostTags).toHaveBeenCalledWith(Number(id));
    });
  });

  // ========== PAUSE ==========
  describe('pause', () => {
    it('should pause a Solicitacao (success case)', async () => {
      const id = '1';
      jest.spyOn(service, 'pause').mockResolvedValueOnce(mockSolicitacao as any);

      const result = await controller.pause(mockquery,+id,jwt);
      expect(result).toEqual(mockSolicitacao);
      expect(service.pause).toHaveBeenCalledWith(Number(id));
    });

    it('should throw an error if pause fails', async () => {
      const id = '1';
      jest.spyOn(service, 'pause').mockRejectedValueOnce(new Error('Error pausing Solicitacao'));

      await expect(controller.pause(mockquery,+id,jwt)).rejects.toThrow('Error pausing Solicitacao');
      expect(service.pause).toHaveBeenCalledWith(Number(id));
    });
  }); */
});
