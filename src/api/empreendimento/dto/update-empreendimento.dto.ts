import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpreendimentoDto } from './create-empreendimento.dto';

export class UpdateEmpreendimentoDto extends PartialType(CreateEmpreendimentoDto) {}
