import { PartialType } from '@nestjs/mapped-types';
import { CreateConstrutoraDto } from './create-construtora.dto';

export class UpdateConstrutoraDto extends PartialType(CreateConstrutoraDto) {}
