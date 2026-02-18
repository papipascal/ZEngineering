import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateDataOriginDto {
  @ApiProperty() @IsUUID() equipmentId!: string;
  @ApiProperty() @IsString() fieldName!: string;
  @ApiProperty() @IsString() fieldValue!: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() sourceEntryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sourceDocumentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceRef?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceRevision?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() sourceIssueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourcePage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
