import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChangeRequestDto {
  @ApiProperty({ description: 'Equipment ID to modify' })
  @IsUUID()
  equipmentId!: string;

  @ApiProperty({ example: 'operatingPressure', description: 'Field name to change' })
  @IsString()
  fieldName!: string;

  @ApiProperty({ example: '3.5', description: 'New value for the field' })
  @IsString()
  newValue!: string;

  @ApiProperty({ required: false, example: 'Updated after recent test results' })
  @IsOptional()
  @IsString()
  justification?: string;
}
