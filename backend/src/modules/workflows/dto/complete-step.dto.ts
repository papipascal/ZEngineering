import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteStepDto {
  @ApiProperty({ example: 'approve', enum: ['approve', 'reject', 'complete', 'skip'] })
  @IsString()
  @IsIn(['approve', 'reject', 'complete', 'skip'])
  action!: string;

  @ApiProperty({ example: 'Looks good, approved.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'uuid-of-user', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}
