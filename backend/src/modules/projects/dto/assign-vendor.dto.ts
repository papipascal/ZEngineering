import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignVendorDto {
  @ApiProperty()
  @IsUUID()
  vendorId!: string;

  @ApiProperty({ required: false, example: 'Selected for pumps' })
  @IsOptional()
  @IsString()
  notes?: string;
}
