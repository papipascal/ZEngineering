import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Discipline } from '@prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'jean@zen.io' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+33 6 12 34 56 78' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline;

  @ApiPropertyOptional({ example: 'Ingénieur Senior Process' })
  @IsOptional()
  @IsString()
  title?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'OldPassword123!' })
  @IsString()
  currentPassword!: string;

  @ApiPropertyOptional({ example: 'NewPassword456!' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
