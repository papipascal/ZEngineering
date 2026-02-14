import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShareDocumentDto {
  @ApiProperty({ example: 'colleague@zengineering.local' })
  @IsEmail()
  recipientEmail!: string;

  @ApiProperty({ required: false, example: 'Please review this datasheet' })
  @IsOptional()
  @IsString()
  message?: string;
}
