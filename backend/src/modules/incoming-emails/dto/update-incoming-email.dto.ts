import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IncomingEmailStatus } from '@prisma/client';

export class UpdateIncomingEmailDto {
  @ApiProperty({ enum: ['READ', 'ARCHIVED'] })
  @IsEnum(IncomingEmailStatus)
  status: IncomingEmailStatus;
}
