import { ApiProperty } from "@nestjs/swagger";

export class ErrorEmpreendimentoEntity {
    @ApiProperty({
      description: 'Mensagem de erro',
      type: String,
    })
    message: string
}