import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscussionDto {
  @ApiProperty({ example: 'Pump 125-PR-601 vibration issue' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'We noticed excessive vibration during the test run...' })
  @IsString()
  content!: string;

  @ApiProperty({ example: 'uuid-of-author' })
  @IsUUID()
  authorId!: string;

  @ApiProperty({ example: 'uuid-of-project' })
  @IsUUID()
  projectId!: string;

  @ApiProperty({ example: 'uuid-of-equipment', required: false, description: 'Link discussion to specific equipment' })
  @IsOptional()
  @IsUUID()
  equipmentId?: string;
}
