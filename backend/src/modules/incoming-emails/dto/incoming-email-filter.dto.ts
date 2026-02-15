import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { IncomingEmailStatus } from '@prisma/client';

export class IncomingEmailFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: IncomingEmailStatus })
  @IsOptional()
  @IsEnum(IncomingEmailStatus)
  status?: IncomingEmailStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
