import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMaintenancePlanDto } from './create-maintenance-plan.dto.js';

export class UpdateMaintenancePlanDto extends PartialType(
  OmitType(CreateMaintenancePlanDto, ['equipmentId'] as const),
) {}
