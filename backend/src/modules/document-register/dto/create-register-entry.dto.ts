import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { Discipline, DocRegisterStatus } from '@prisma/client';

export class CreateRegisterEntryDto {
  @ApiProperty() @IsUUID() projectId: string;
  @ApiProperty({ example: 'ZG-125-PRC-001' }) @IsString() documentNumber: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ enum: Discipline }) @IsEnum(Discipline) discipline: Discipline;
  @ApiProperty() @IsUUID() ownerId: string;

  @ApiProperty({ required: false }) @IsOptional() @IsUUID() issuerId?: string;
  @ApiProperty({ required: false, default: 'A' }) @IsOptional() @IsString() revision?: string;
  @ApiProperty({ required: false, enum: DocRegisterStatus }) @IsOptional() @IsEnum(DocRegisterStatus) status?: DocRegisterStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() issueDate?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
