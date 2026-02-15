import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPartnerDto {
  @ApiProperty({ example: 'Licensor Corp.' })
  @IsString()
  name!: string;

  @ApiProperty({ required: false, example: 'Licensor' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
