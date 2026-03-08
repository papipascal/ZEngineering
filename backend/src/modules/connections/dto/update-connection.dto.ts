import { PartialType } from '@nestjs/mapped-types';
import { CreateConnectionDto } from './create-connection.dto.js';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateConnectionDto extends PartialType(
  OmitType(CreateConnectionDto, ['projectId'] as const),
) {}
