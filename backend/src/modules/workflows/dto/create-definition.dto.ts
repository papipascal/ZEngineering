import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StepDefinitionDto {
  @ApiProperty({ example: 'Review' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 0 })
  order!: number;

  @ApiProperty({ example: 'manual', description: 'manual or automatic' })
  @IsString()
  type!: string;

  @ApiProperty({ example: 'manager', required: false })
  @IsOptional()
  @IsString()
  assigneeRole?: string;
}

export class TransitionDto {
  @ApiProperty({ example: 0, description: 'Index of source step' })
  from!: number;

  @ApiProperty({ example: 1, description: 'Index of target step' })
  to!: number;

  @ApiProperty({ example: 'approve', required: false })
  @IsOptional()
  @IsString()
  condition?: string;
}

export class CreateDefinitionDto {
  @ApiProperty({ example: 'Document Validation' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Standard 3-step document validation workflow', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [StepDefinitionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDefinitionDto)
  steps!: StepDefinitionDto[];

  @ApiProperty({ type: [TransitionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransitionDto)
  transitions!: TransitionDto[];
}
