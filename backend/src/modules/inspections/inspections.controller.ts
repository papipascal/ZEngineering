import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { InspectionsService } from './inspections.service.js';
import { CreateInspectionDto } from './dto/create-inspection.dto.js';
import { UpdateInspectionDto } from './dto/update-inspection.dto.js';

@ApiTags('inspections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/inspections')
export class InspectionsController {
  constructor(private readonly service: InspectionsService) {}

  @Post()
  create(@Body() dto: CreateInspectionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('equipmentId') equipmentId?: string,
    @Query('type') type?: string,
    @Query('result') result?: string,
  ) {
    return this.service.findAll({ equipmentId, type, result });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
