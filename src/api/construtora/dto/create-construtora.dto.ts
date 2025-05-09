import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateConstrutoraDto {

    @ApiProperty({ description: 'CNPJ da construtora', example: '00000000000100', type: String })
    @IsNotEmpty({ message: 'CNPJ é obrigatório' })
    @IsString({ message: 'CNPJ deve ser uma string' })
    cnpj: string

    @ApiProperty({ description: 'Razão social da construtora', example: 'Construtora A', type: String })
    @IsNotEmpty({ message: 'Razão social é obrigatório' })
    @IsString({ message: 'Razão social deve ser uma string' })
    razaosocial: string

    @ApiProperty({ description: 'Nome fantasia da construtora', example: 'Construtora A', type: String })
    @IsNotEmpty({ message: 'Nome fantasia é obrigatório' })
    @IsString({ message: 'Nome fantasia deve ser uma string' })
    fantasia: string

    @ApiProperty({ description: 'Telefone da construtora', example: '0000000000', type: String })
    @IsNotEmpty({ message: 'Telefone é obrigatório' })
    @IsString({ message: 'Telefone deve ser uma string' })
    tel: string

    @ApiProperty({ description: 'E-mail da construtora', example: '0dMgM@example.com', type: String })
    @IsNotEmpty({ message: 'E-mail é obrigatório' })
    @IsEmail()
    email: string

    constructor(partial: Partial<CreateConstrutoraDto>) {
     this.cnpj = partial?.cnpj;
     this.razaosocial = partial?.razaosocial;
     this.fantasia = partial?.fantasia;
     this.tel = partial?.tel;
     this.email = partial?.email;
    }

}
