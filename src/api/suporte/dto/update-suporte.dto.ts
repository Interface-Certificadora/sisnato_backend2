import { PartialType } from '@nestjs/mapped-types';
import { CreateSuporteDto } from './create-suporte.dto';

export class UpdateSuporteDto extends PartialType(CreateSuporteDto) {}
