import { PartialType } from '@nestjs/mapped-types';
import { CreateChamadoDto } from './create-chamado.dto';

export class UpdateChamadoDto extends PartialType(CreateChamadoDto) {}
