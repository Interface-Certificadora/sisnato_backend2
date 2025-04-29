import { PartialType } from '@nestjs/swagger';
import { CreatePixDto } from './create-pix.dto';

export class UpdatePixDto extends PartialType(CreatePixDto) {}
