import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsUUID, IsEnum, IsBoolean, IsInt,
} from 'class-validator';
import {
  EmailRouteTarget, Discipline, EmailPurpose, EmailDocumentIntent,
} from '@prisma/client';

export class CreateRoutingRuleDto {
  @ApiProperty() @IsUUID() projectId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() priority?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() senderDomain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() senderEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subjectContains?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isExternal?: boolean;

  @ApiProperty({ enum: EmailRouteTarget }) @IsEnum(EmailRouteTarget) target!: EmailRouteTarget;
  @ApiPropertyOptional() @IsOptional() @IsUUID() targetUserId?: string;
  @ApiPropertyOptional({ enum: Discipline }) @IsOptional() @IsEnum(Discipline) targetDiscipline?: Discipline;

  @ApiPropertyOptional({ enum: EmailPurpose }) @IsOptional() @IsEnum(EmailPurpose) autoPurpose?: EmailPurpose;
  @ApiPropertyOptional({ enum: EmailDocumentIntent }) @IsOptional() @IsEnum(EmailDocumentIntent) autoIntent?: EmailDocumentIntent;
}

export class UpdateRoutingRuleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() priority?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() senderDomain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() senderEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subjectContains?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isExternal?: boolean;

  @ApiPropertyOptional({ enum: EmailRouteTarget }) @IsOptional() @IsEnum(EmailRouteTarget) target?: EmailRouteTarget;
  @ApiPropertyOptional() @IsOptional() @IsUUID() targetUserId?: string;
  @ApiPropertyOptional({ enum: Discipline }) @IsOptional() @IsEnum(Discipline) targetDiscipline?: Discipline;

  @ApiPropertyOptional({ enum: EmailPurpose }) @IsOptional() @IsEnum(EmailPurpose) autoPurpose?: EmailPurpose;
  @ApiPropertyOptional({ enum: EmailDocumentIntent }) @IsOptional() @IsEnum(EmailDocumentIntent) autoIntent?: EmailDocumentIntent;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}
