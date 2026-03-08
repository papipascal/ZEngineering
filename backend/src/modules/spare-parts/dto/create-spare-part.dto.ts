import { IsString, IsOptional, IsEnum, IsNumber, IsInt, Min } from 'class-validator';
import { SparePartCriticality } from '@prisma/client';

export class CreateSparePartDto {
  @IsString()
  equipmentId: string;

  @IsString()
  partNumber: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  supplierRef?: string;

  @IsOptional()
  @IsEnum(SparePartCriticality)
  criticality?: SparePartCriticality;

  @IsOptional()
  @IsInt()
  @Min(0)
  recommendedQty?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  leadTimeDays?: number;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsString()
  storageCondition?: string;

  @IsOptional()
  @IsInt()
  commissioningQty?: number;

  @IsOptional()
  @IsInt()
  operationQty?: number;

  @IsOptional()
  @IsInt()
  capitalSpareQty?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  documentId?: string;
}
