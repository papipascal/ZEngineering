import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSparePartDto } from './create-spare-part.dto.js';

export class UpdateSparePartDto extends PartialType(
  OmitType(CreateSparePartDto, ['equipmentId'] as const),
) {}
