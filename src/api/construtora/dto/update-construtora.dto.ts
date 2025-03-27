import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
