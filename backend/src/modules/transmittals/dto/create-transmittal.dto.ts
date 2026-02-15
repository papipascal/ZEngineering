import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransmittalPurpose } from '@prisma/client';

export class TransmittalItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registerEntryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateTransmittalDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty({ enum: TransmittalPurpose })
  @IsEnum(TransmittalPurpose)
  purpose: TransmittalPurpose;

  @ApiProperty()
  @IsString()
  recipientName: string;

  @ApiProperty()
  @IsString()
  recipientEmail: string;

  @ApiProperty({ description: 'VENDOR, PARTNER, CLIENT, OTHER' })
  @IsString()
  recipientType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty()
  @IsString()
  sentById: string;

  @ApiPropertyOptional({ type: [TransmittalItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransmittalItemDto)
  items?: TransmittalItemDto[];
}
