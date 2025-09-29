import { PartialType } from '@nestjs/swagger';
import { CreateIntelesignDto } from './create-intelesign.dto';

export class UpdateIntelesignDto extends PartialType(CreateIntelesignDto) {}
