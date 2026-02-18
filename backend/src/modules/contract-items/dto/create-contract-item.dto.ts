import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsNumber, IsInt,
} from 'class-validator';
import {
  ContractItemType, ContractItemStatus, ContractItemPriority,
  ContractImpact, Discipline,
} from '@prisma/client';

export class CreateContractItemDto {
  @ApiProperty() @IsUUID() projectId!: string;
  @ApiProperty({ enum: ContractItemType }) @IsEnum(ContractItemType) type!: ContractItemType;
  @ApiProperty() @IsString() title!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clauseRef?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() docRef?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() docRevision?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() docPage?: string;
  @ApiPropertyOptional({ enum: ContractItemStatus })
  @IsOptional() @IsEnum(ContractItemStatus) status?: ContractItemStatus;
  @ApiPropertyOptional({ enum: ContractItemPriority })
  @IsOptional() @IsEnum(ContractItemPriority) priority?: ContractItemPriority;
  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional() @IsEnum(Discipline) discipline?: Discipline;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assigneeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;

  // REQUIREMENT fields
  @ApiPropertyOptional() @IsOptional() @IsString() reqCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reqAction?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() consequence?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scopeLimit?: string;

  // CHANGE fields
  @ApiPropertyOptional() @IsOptional() @IsString() changeRequestedBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() changeDate?: string;
  @ApiPropertyOptional({ enum: ContractImpact })
  @IsOptional() @IsEnum(ContractImpact) commercialImpact?: ContractImpact;
  @ApiPropertyOptional() @IsOptional() @IsNumber() commercialValue?: number;
  @ApiPropertyOptional({ enum: ContractImpact })
  @IsOptional() @IsEnum(ContractImpact) scheduleImpact?: ContractImpact;
  @ApiPropertyOptional() @IsOptional() @IsInt() scheduleDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() technicalImpact?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() clientRef?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deviationType?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() documentId?: string;
}
