import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { InspectionType, InspectionResult } from '@prisma/client';

export class CreateInspectionDto {
  @IsString()
  equipmentId: string;

  @IsEnum(InspectionType)
  type: InspectionType;

  @IsEnum(InspectionResult)
  result: InspectionResult;

  @IsDateString()
  inspectionDate: string;

  @IsOptional()
  @IsString()
  inspector?: string;

  @IsOptional()
  @IsString()
  inspectorId?: string;

  @IsOptional()
  @IsDateString()
  nextInspectionDate?: string;

  @IsOptional()
  @IsString()
  certificate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  documentId?: string;
}
