import { PartialType } from '@nestjs/swagger';
import { CreateRegisterEntryDto } from './create-register-entry.dto.js';

export class UpdateRegisterEntryDto extends PartialType(CreateRegisterEntryDto) {}
