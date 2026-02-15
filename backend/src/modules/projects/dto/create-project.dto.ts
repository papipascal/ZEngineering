import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Chemical Plant - Unit U_B' })
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ required: false, example: 'John Doe - j.doe@client.com' })
  @IsOptional()
  @IsString()
  clientContact?: string;

  @ApiProperty({ required: false, default: 'active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, example: 'ua-unit@zengineering.local' })
  @IsOptional()
  @IsString()
  projectEmail?: string;
}
