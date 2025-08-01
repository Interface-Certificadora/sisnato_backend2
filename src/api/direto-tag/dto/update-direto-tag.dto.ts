import { PartialType } from '@nestjs/swagger';
import { CreateDiretoTagDto } from './create-direto-tag.dto';

export class UpdateDiretoTagDto extends PartialType(CreateDiretoTagDto) {}