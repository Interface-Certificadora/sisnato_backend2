import { PartialType } from '@nestjs/mapped-types';
import { CreateFinanceiroDto } from './create-financeiro.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateFinanceiroDto{
    @ApiProperty({ description: 'Razão Social da Empresa', example: 'Nome da Empresa', type: String })
    @IsOptional()
    razaosocial?: string

    @ApiProperty({ description: 'Telefone da Financeira', example: '999999999', type: String })
    @IsOptional()
    tel?: string

    @ApiProperty({ description: 'Email da Financeira', example: 'johndoe@me.com', type: String })
    @IsOptional()
    @IsEmail({},{ message: 'Email inválido' })
    email?: string

    @ApiProperty({ description: 'Responsavel da Financeira', example: 1, type: Number })
    @IsOptional()
    responsavelId?: number

    @ApiProperty({description: 'Fantasia da Financeira', example:'TAG', type: String})
    @IsOptional()
    fantasia?: string

    @ApiProperty({ description: 'Construtoras', example: [1,2,3], type: [Number] })
    @IsOptional()
    construtoras?: number[]
}
