import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { MaintenanceFrequency } from '@prisma/client';

export class CreateMaintenancePlanDto {
  @IsString()
  equipmentId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MaintenanceFrequency)
  frequency: MaintenanceFrequency;

  @IsOptional()
  @IsNumber()
  estimatedDurationH?: number;

  @IsOptional()
  @IsString()
  requiredSkills?: string;

  @IsOptional()
  @IsString()
  requiredTools?: string;

  @IsOptional()
  @IsString()
  safetyNotes?: string;

  @IsOptional()
  @IsDateString()
  lastPerformedAt?: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;
}
