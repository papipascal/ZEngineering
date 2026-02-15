import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DocumentRegisterService } from './document-register.service.js';
import { CreateRegisterEntryDto } from './dto/create-register-entry.dto.js';
import { UpdateRegisterEntryDto } from './dto/update-register-entry.dto.js';
import { RegisterFilterDto } from './dto/register-filter.dto.js';

@ApiTags('Document Register')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/document-register')
export class DocumentRegisterController {
  constructor(private readonly service: DocumentRegisterService) {}

  @Get()
  findAll(@Query() filter: RegisterFilterDto) {
    return this.service.findAll(filter);
  }

  @Post()
  create(@Body() dto: CreateRegisterEntryDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegisterEntryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
