import { PartialType } from '@nestjs/swagger';
import { CreateDiretoDto } from './create-direto.dto';

export class UpdateDiretoDto extends PartialType(CreateDiretoDto) {}
