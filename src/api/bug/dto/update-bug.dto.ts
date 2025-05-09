import { PartialType } from '@nestjs/swagger';
import { CreateBugDto } from './create-bug.dto';

export class UpdateBugDto extends PartialType(CreateBugDto) {}
