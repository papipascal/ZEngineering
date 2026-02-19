import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Discipline } from '@prisma/client';

export class ReviewProposalDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  proposedDocNumber?: string;

  @IsOptional()
  @IsString()
  proposedTitle?: string;

  @IsOptional()
  @IsEnum(Discipline)
  proposedDiscipline?: Discipline;
}
