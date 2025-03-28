import { PartialType } from '@nestjs/swagger';
import { CreateNowDto } from './create-now.dto';

export class UpdateNowDto extends PartialType(CreateNowDto) {}
