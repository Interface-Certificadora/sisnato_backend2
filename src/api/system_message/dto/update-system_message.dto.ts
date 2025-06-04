import { PartialType } from '@nestjs/swagger';
import { CreateSystemMessageDto } from './create-system_message.dto';

export class UpdateSystemMessageDto extends PartialType(
  CreateSystemMessageDto,
) {}
