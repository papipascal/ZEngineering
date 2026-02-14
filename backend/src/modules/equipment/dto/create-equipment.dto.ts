import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EquipmentCategory } from '@prisma/client';

export class CreateEquipmentDto {
  @ApiProperty({ example: '125-VV-601', description: 'Unique tag number' })
  @IsString()
  tagNumber!: string;

  @ApiProperty({ example: 'Blowdown Drum' })
  @IsString()
  service!: string;

  @ApiProperty({ enum: EquipmentCategory, example: 'VESSEL' })
  @IsEnum(EquipmentCategory)
  category!: EquipmentCategory;

  @ApiProperty({ example: 'drum', required: false, description: 'Sub-type: pump, blower, fan, filter, etc.' })
  @IsOptional()
  @IsString()
  subType?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: 'CS + 3 mm CA', required: false })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ example: 3.5, required: false, description: 'Operating pressure (barg)' })
  @IsOptional()
  @IsNumber()
  operatingPressure?: number;

  @ApiProperty({ example: 120, required: false, description: 'Operating temperature (°C)' })
  @IsOptional()
  @IsNumber()
  operatingTemperature?: number;

  @ApiProperty({ example: 5.0, required: false, description: 'Design pressure (barg)' })
  @IsOptional()
  @IsNumber()
  designPressure?: number;

  @ApiProperty({ example: 150, required: false, description: 'Design temperature (°C)' })
  @IsOptional()
  @IsNumber()
  designTemperature?: number;

  @ApiProperty({ example: 2500, required: false, description: 'Estimated weight (kg)' })
  @IsOptional()
  @IsNumber()
  estimatedWeight?: number;

  @ApiProperty({ example: 'DN 300 x 2000mm', required: false })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'uuid-of-project' })
  @IsUUID()
  projectId!: string;
}
