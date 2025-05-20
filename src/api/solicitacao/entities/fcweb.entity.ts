import { ApiProperty } from "@nestjs/swagger";

/**
 * Registro do Fcweb.
 * @param {number} id - ID do registro do Fcweb.
 * @param {string} andamento - Andamento do registro do Fcweb.
 * @param {Date} dt_agenda - Data de agenda do registro do Fcweb.
 * @param {string} hr_agenda - Hora de agenda do registro do Fcweb.
 * @param {Date} dt_aprovacao - Data de aprovacao do registro do Fcweb.
 * @param {string} hr_aprovacao - Hora de aprovacao do registro do Fcweb.
 */
export class FcwebEntity {
  @ApiProperty()
  id: number;
  @ApiProperty()
  andamento: string;
  @ApiProperty()
  dt_agenda: Date;
  @ApiProperty()
  hr_agenda: string;
  @ApiProperty()
  dt_aprovacao: Date;
  @ApiProperty()
  hr_aprovacao: string;
}
