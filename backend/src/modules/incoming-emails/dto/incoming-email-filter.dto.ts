import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { IncomingEmailStatus, EmailPurpose } from '@prisma/client';

export class IncomingEmailFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: IncomingEmailStatus })
  @IsOptional()
  @IsEnum(IncomingEmailStatus)
  status?: IncomingEmailStatus;

  @ApiPropertyOptional({ enum: EmailPurpose })
  @IsOptional()
  @IsEnum(EmailPurpose)
  purpose?: EmailPurpose;

  @ApiPropertyOptional({ description: 'Filter by external senders (true/false)' })
  @IsOptional()
  @IsBooleanString()
  isExternal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
