import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ContractItemType, ContractItemStatus, ContractItemPriority, Discipline } from '@prisma/client';

export class FilterContractItemsDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() projectId?: string;
  @ApiPropertyOptional({ enum: ContractItemType })
  @IsOptional() @IsEnum(ContractItemType) type?: ContractItemType;
  @ApiPropertyOptional({ enum: ContractItemStatus })
  @IsOptional() @IsEnum(ContractItemStatus) status?: ContractItemStatus;
  @ApiPropertyOptional({ enum: ContractItemPriority })
  @IsOptional() @IsEnum(ContractItemPriority) priority?: ContractItemPriority;
  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional() @IsEnum(Discipline) discipline?: Discipline;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assigneeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reqCategory?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
