import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

// Classe auxiliar para tipar o retorno do relacionamento (cidade)
export class CidadeRelation {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: String })
  @Expose()
  nome: string;

  @ApiResponseProperty({ type: Object })
  @Expose()
  estado: any; // Pode tipar melhor se tiver entity de Estado
}

export class ArParceira {
  @ApiResponseProperty({ type: Number })
  @Expose()
  id: number;

  @ApiResponseProperty({ type: Boolean, example: true })
  @Expose()
  status: boolean;

  @ApiResponseProperty({ type: String, example: 'SOLUTI' })
  @Expose()
  ac: string;

  @ApiResponseProperty({ type: String, example: 'AR SAO PAULO' })
  @Expose()
  nome: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  cidadeId: number;

  // Como seu service faz "include: { cidade: ... }", adicionamos aqui
  @ApiResponseProperty({ type: CidadeRelation })
  @Expose()
  @Type(() => CidadeRelation)
  cidade: CidadeRelation;

  @ApiResponseProperty({ type: String, example: 'Fulano de Tal' })
  @Expose()
  responsavel: string;

  @ApiResponseProperty({ type: String, example: '(11) 99999-9999' })
  @Expose()
  telefone: string;

  @ApiResponseProperty({ type: String, example: 'VOUCHER' })
  @Expose()
  valor: string;

  @ApiResponseProperty({ type: String, example: 'Rua das Flores, 123' })
  @Expose()
  endereco: string;

  @ApiResponseProperty({ type: String })
  @Expose()
  obs: string;

  @ApiResponseProperty({ type: Number })
  @Expose()
  latitude: number;

  @ApiResponseProperty({ type: Number })
  @Expose()
  longitude: number;

  @ApiResponseProperty({ type: Date })
  @Expose()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ArParceira>) {
    Object.assign(this, partial);
  }
}
