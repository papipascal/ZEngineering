import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartWorkflowDto {
  @ApiProperty({ example: 'uuid-of-definition' })
  @IsString()
  definitionId!: string;

  @ApiProperty({ example: 'uuid-of-project', required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({
    example: { documentId: 'doc-123', title: 'Technical Specs v2' },
    required: false,
    description: 'Arbitrary context data for this workflow instance',
  })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
