import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RelatorioFinanceiroGeral {

    @ApiProperty({
        description: 'Quantidade de usuários',
        type: Number,
    })
    @IsNumber() 
    usuarios: number;

    @ApiProperty({
        description: 'Quantidade de construtoras',
        type: Number,
    })
    @IsNumber()
    construtoras: number;

    @ApiProperty({
        description: 'Quantidade de relatórios',
        type: Number,
    })
    @IsNumber()
    relatorios: number;

    @ApiProperty({
        description: 'Valor total de cobrancas em aberto',
        type: String,
    })
    @IsString()
    cobrancas_aberto: string;
}
