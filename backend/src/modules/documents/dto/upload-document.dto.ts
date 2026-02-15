import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Project ID' })
  @IsUUID()
  projectId!: string;

  @ApiProperty({ enum: DocumentCategory, required: false, default: 'OTHER' })
  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiProperty({ required: false, example: 'Pump 125-PR-601 datasheet from vendor MOUVEX' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  discussionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  commentId?: string;

  @ApiProperty({ required: false, description: 'Link to a Document Register entry as a file revision' })
  @IsOptional()
  @IsUUID()
  registerEntryId?: string;
}
