import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'I agree, we should check the alignment...' })
  @IsString()
  content!: string;

  @ApiProperty({ example: 'uuid-of-author' })
  @IsUUID()
  authorId!: string;
}
