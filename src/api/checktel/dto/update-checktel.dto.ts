import { PartialType } from '@nestjs/swagger';
import { CreateChecktelDto } from './create-checktel.dto';

export class UpdateChecktelDto extends PartialType(CreateChecktelDto) {}
