import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateConstrutoraDto {

    @ApiPropertyOptional({
        description: 'Razão social da construtora',
        example: 'Construtora A',
        type: String
    })
    @IsOptional()
    @IsString({ message: 'Razão social deve ser uma string' })
    razaosocial?: string;

    @ApiPropertyOptional({
        description: 'Telefone da construtora',
        example: '0000000000',
        type: String
    })
    @IsOptional()
    @IsString({ message: 'Telefone deve ser uma string' })
    tel?: string;

    @ApiPropertyOptional({
        description: 'E-mail da construtora',
        example: '0dMgM@example.com',
        type: String
    })
    @IsOptional()
    @IsString({ message: 'E-mail deve ser uma string' })
    email?: string;

    @ApiPropertyOptional({
        description: 'Fantasia da construtora',
        example: 'Construtora A',
        type: String
    })
    @IsOptional()
    @IsString({ message: 'Fantasia deve ser uma string' })
    fantasia?: string;

    @ApiPropertyOptional({
        description: 'Valor do certificado',
        example: '1000',
        type: Number
    })
    @IsOptional()
    @IsNumber({},{ message: 'Valor do certificado deve ser um numero' })
    valor_cert?: number;

    @ApiPropertyOptional({
        description: 'Responsavel da construtora',
        example: '1',
        type: Number
    })
    @IsOptional()
    @IsNumber({},{ message: 'Responsavel deve ser um numero' })
    responsavelId?: number;

    @ApiPropertyOptional({
        description: 'Status da construtora',
        example: 'true',
        type: Boolean
    })
    @IsOptional()
    @IsBoolean({ message: 'Status deve ser um booleano' })
    status?: boolean;

    @ApiPropertyOptional({
        description: 'Observação da construtora',
        example: 'Observação da construtora',
        type: String
    })
    @IsOptional()
    @IsString({ message: 'Observação deve ser uma string' })
    obs?: string;

    @ApiPropertyOptional({
        description: 'Atividade da construtora',
        example: 'Atividade da construtora',
        type: String
    })
    @IsOptional()
    @IsString({ message: 'Atividade deve ser uma string' })
    atividade?: string;
}
