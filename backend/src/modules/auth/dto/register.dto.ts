import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Discipline } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@zengineering.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ required: false, default: 'member' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ enum: Discipline, required: false })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline;
}
