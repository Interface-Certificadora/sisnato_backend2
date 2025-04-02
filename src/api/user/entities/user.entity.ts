import { ApiResponseProperty } from '@nestjs/swagger';

export class User {
  @ApiResponseProperty({ type: Number })
  id: number;

  @ApiResponseProperty({ type: String })
  username: string;

  @ApiResponseProperty({ type: String })
  password: string;

  @ApiResponseProperty({ type: String })
  password_key: string;

  @ApiResponseProperty({ type: String })
  telefone: string;

  @ApiResponseProperty({ type: String })
  email: string;

  @ApiResponseProperty({ type: String })
  cpf: string;

  @ApiResponseProperty({ type: String })
  nome: string;

  @ApiResponseProperty({ type: String })
  cargo: string;

  @ApiResponseProperty({ type: String })
  hierarquia: string;

  @ApiResponseProperty({ type: Boolean })
  reset_password: boolean;

  @ApiResponseProperty({ type: Boolean })
  status: boolean;

  @ApiResponseProperty({ type: Boolean })
  sms_relat: boolean;

  @ApiResponseProperty({ type: Boolean })
  termos: boolean;

  @ApiResponseProperty({ type: Date })
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  updatedAt: Date;


  constructor(partial?: Partial<User>) {
    this.id = partial?.id;
    this.username = partial?.username;
    this.password = partial?.password;
    this.password_key = partial?.password_key;
    this.telefone = partial?.telefone;
    this.email = partial?.email;
    this.cpf = partial?.cpf;
    this.nome = partial?.nome;
    this.cargo = partial?.cargo;
    this.hierarquia = partial?.hierarquia;
    this.reset_password = partial?.reset_password;
    this.status = partial?.status;
    this.sms_relat = partial?.sms_relat;
    this.termos = partial?.termos;
    this.createdAt = partial?.createdAt;
    this.updatedAt = partial?.updatedAt;
  }
}
