import { IsOptional, IsNumberString } from 'class-validator';

export class GetOptionsDto {
  /**
   * ID da construtora selecionada. Deve ser uma string contendo um número.
   * @example 1
   */
  @IsOptional()
  @IsNumberString({}, { message: 'O ID da construtora deve ser um número.' })
  construtoraId?: string;

  /**
   * ID do empreendimento selecionado. Deve ser uma string contendo um número.
   * @example 45
   */
  @IsOptional()
  @IsNumberString({}, { message: 'O ID do empreendimento deve ser um número.' })
  empreendimentoId?: string;

  /**
   * ID da financeira selecionada.
   * @example 7
   */
  @IsOptional()
  @IsNumberString({}, { message: 'O ID da financeira deve ser um número.' })
  financeiroId?: string; // NOVO CAMPO
}
