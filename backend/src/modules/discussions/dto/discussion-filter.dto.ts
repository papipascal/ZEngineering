import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DiscussionFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({ required: false, description: 'Filter by linked equipment ID' })
  @IsOptional()
  @IsString()
  equipmentId?: string;

  @ApiProperty({ required: false, description: 'Search in title and content' })
  @IsOptional()
  @IsString()
  search?: string;
}
