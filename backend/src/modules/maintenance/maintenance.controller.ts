import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { MaintenanceService } from './maintenance.service.js';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto.js';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto.js';

@ApiTags('maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  create(@Body() dto: CreateMaintenancePlanDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('equipmentId') equipmentId?: string,
    @Query('frequency') frequency?: string,
  ) {
    return this.service.findAll({ equipmentId, frequency });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaintenancePlanDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
