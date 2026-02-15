import { PartialType } from '@nestjs/swagger';
import { CreateTransmittalDto } from './create-transmittal.dto.js';

export class UpdateTransmittalDto extends PartialType(CreateTransmittalDto) {}
