import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EquipmentCategory } from '@prisma/client';

export class EquipmentFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ enum: EquipmentCategory, required: false })
  @IsOptional()
  @IsEnum(EquipmentCategory)
  category?: EquipmentCategory;

  @ApiProperty({ required: false, description: 'Search in tag number or service description' })
  @IsOptional()
  @IsString()
  search?: string;
}
