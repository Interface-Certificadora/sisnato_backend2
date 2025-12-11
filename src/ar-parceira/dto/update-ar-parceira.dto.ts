import { PartialType } from '@nestjs/swagger';
import { CreateArParceiraDto } from './create-ar-parceira.dto';

export class UpdateArParceiraDto extends PartialType(CreateArParceiraDto) {}
