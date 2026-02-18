import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IncomingEmailStatus, EmailPurpose, EmailDocumentIntent } from '@prisma/client';

export class UpdateIncomingEmailDto {
  @ApiProperty({ enum: IncomingEmailStatus })
  @IsOptional()
  @IsEnum(IncomingEmailStatus)
  status?: IncomingEmailStatus;

  @ApiPropertyOptional({ enum: EmailPurpose })
  @IsOptional()
  @IsEnum(EmailPurpose)
  purpose?: EmailPurpose;

  @ApiPropertyOptional({ enum: EmailDocumentIntent })
  @IsOptional()
  @IsEnum(EmailDocumentIntent)
  documentIntent?: EmailDocumentIntent;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
