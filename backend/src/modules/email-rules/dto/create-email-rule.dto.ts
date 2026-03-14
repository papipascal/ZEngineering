import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmailRouteTarget, Discipline, EmailPurpose, EmailDocumentIntent } from '@prisma/client';

export class CreateEmailRuleDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderEmail?: string;

  @ApiPropertyOptional({ description: 'e.g. vendor-corp.com' })
  @IsOptional()
  @IsString()
  senderDomain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectContains?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @ApiProperty({ enum: EmailRouteTarget })
  @IsEnum(EmailRouteTarget)
  target: EmailRouteTarget;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional()
  @IsEnum(Discipline)
  targetDiscipline?: Discipline;

  @ApiPropertyOptional({ enum: EmailPurpose })
  @IsOptional()
  @IsEnum(EmailPurpose)
  autoPurpose?: EmailPurpose;

  @ApiPropertyOptional({ enum: EmailDocumentIntent })
  @IsOptional()
  @IsEnum(EmailDocumentIntent)
  autoIntent?: EmailDocumentIntent;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
