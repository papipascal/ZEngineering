import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ReplyEmailDto {
  @ApiProperty({ description: 'ID of the user sending the reply' })
  @IsUUID()
  senderId!: string;

  @ApiProperty({ description: 'Reply body text' })
  @IsString()
  body!: string;
}
