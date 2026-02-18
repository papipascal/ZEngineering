import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString } from 'class-validator';

export class FilterDataOriginDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() equipmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fieldName?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() validatedById?: string;
}
