import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ConnectionType } from '@prisma/client';

export class ConnectionFilterDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  equipmentId?: string;

  @IsOptional()
  @IsEnum(ConnectionType)
  type?: ConnectionType;

  @IsOptional()
  @IsString()
  search?: string;
}
