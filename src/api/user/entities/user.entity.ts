import { ApiResponseProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class User {
  @ApiResponseProperty({ type: Number })
  id: number;

  @ApiResponseProperty({ type: String })
  username: string;

  @ApiResponseProperty({ type: String })
  @Exclude()
  password: string;

  @ApiResponseProperty({ type: String })
  @Exclude()
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
    Object.assign(this, partial);
  }
}
