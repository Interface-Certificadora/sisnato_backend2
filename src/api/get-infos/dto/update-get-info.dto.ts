import { PartialType } from '@nestjs/swagger';
import { CreateGetInfoDto } from './create-get-info.dto';

export class UpdateGetInfoDto extends PartialType(CreateGetInfoDto) {}
