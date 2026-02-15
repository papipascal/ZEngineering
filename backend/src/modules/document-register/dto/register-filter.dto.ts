import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { Discipline, DocRegisterStatus } from '@prisma/client';

export class RegisterFilterDto {
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() projectId?: string;
  @ApiProperty({ required: false, enum: Discipline }) @IsOptional() @IsEnum(Discipline) discipline?: Discipline;
  @ApiProperty({ required: false, enum: DocRegisterStatus }) @IsOptional() @IsEnum(DocRegisterStatus) status?: DocRegisterStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() ownerId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() search?: string;
}
