import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ConnectionType } from '@prisma/client';

export class CreateConnectionDto {
  @IsString()
  projectId: string;

  @IsString()
  lineNumber: string;

  @IsEnum(ConnectionType)
  type: ConnectionType;

  @IsOptional()
  @IsString()
  fluid?: string;

  @IsOptional()
  @IsString()
  fromEquipmentId?: string;

  @IsOptional()
  @IsString()
  toEquipmentId?: string;

  @IsOptional()
  @IsString()
  fromNozzle?: string;

  @IsOptional()
  @IsString()
  toNozzle?: string;

  @IsOptional()
  @IsString()
  nominalDiameter?: string;

  @IsOptional()
  @IsString()
  pressureClass?: string;

  @IsOptional()
  @IsString()
  materialSpec?: string;

  @IsOptional()
  @IsString()
  insulationType?: string;

  @IsOptional()
  @IsString()
  paintSystem?: string;

  @IsOptional()
  @IsBoolean()
  isoCertRequired?: boolean;

  @IsOptional()
  @IsString()
  lineListRef?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
