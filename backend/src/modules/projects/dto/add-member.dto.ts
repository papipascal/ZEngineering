import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ required: false, default: 'member', example: 'member' })
  @IsOptional()
  @IsString()
  role?: string;
}
