import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class OrgPositionDto {
  @ApiProperty()
  @IsString()
  role!: string;

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateOrgDto {
  @ApiProperty({ type: [OrgPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrgPositionDto)
  positions!: OrgPositionDto[];
}

export class TreeNodeDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty()
  @IsInt()
  level!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateTreeDto {
  @ApiProperty({ type: [TreeNodeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreeNodeDto)
  nodes!: TreeNodeDto[];
}
