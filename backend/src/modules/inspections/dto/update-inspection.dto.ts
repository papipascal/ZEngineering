import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInspectionDto } from './create-inspection.dto.js';

export class UpdateInspectionDto extends PartialType(
  OmitType(CreateInspectionDto, ['equipmentId'] as const),
) {}
