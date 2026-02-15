import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TransmittalStatus, TransmittalPurpose } from '@prisma/client';

export class TransmittalFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: TransmittalStatus })
  @IsOptional()
  @IsEnum(TransmittalStatus)
  status?: TransmittalStatus;

  @ApiPropertyOptional({ enum: TransmittalPurpose })
  @IsOptional()
  @IsEnum(TransmittalPurpose)
  purpose?: TransmittalPurpose;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
