import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SparePartCriticality } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SparePartsService } from './spare-parts.service.js';
import { CreateSparePartDto } from './dto/create-spare-part.dto.js';
import { UpdateSparePartDto } from './dto/update-spare-part.dto.js';

@ApiTags('spare-parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/spare-parts')
export class SparePartsController {
  constructor(private readonly service: SparePartsService) {}

  @Post()
  create(@Body() dto: CreateSparePartDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('equipmentId') equipmentId?: string,
    @Query('criticality') criticality?: SparePartCriticality,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({ equipmentId, criticality, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSparePartDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
