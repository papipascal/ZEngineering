import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEquipmentDto } from './create-equipment.dto.js';

export class UpdateEquipmentDto extends PartialType(
  OmitType(CreateEquipmentDto, ['projectId'] as const),
) {}
