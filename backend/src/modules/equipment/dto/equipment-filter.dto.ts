import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EquipmentCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class EquipmentFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: EquipmentCategory })
  @IsOptional()
  @IsEnum(EquipmentCategory)
  category?: EquipmentCategory;

  @ApiPropertyOptional({ description: 'Search in tag number or service description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by subType (pump, blower, filter, etc.)' })
  @IsOptional()
  @IsString()
  subType?: string;

  @ApiPropertyOptional({ description: 'Filter by material contains' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: 'Min operating pressure (barg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPressure?: number;

  @ApiPropertyOptional({ description: 'Max operating pressure (barg)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPressure?: number;

  @ApiPropertyOptional({ description: 'Min operating temperature (deg C)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTemperature?: number;

  @ApiPropertyOptional({ description: 'Max operating temperature (deg C)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTemperature?: number;
}
