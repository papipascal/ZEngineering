import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EquipmentService } from './equipment.service.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { EquipmentFilterDto } from './dto/equipment-filter.dto.js';

@ApiTags('Equipment')
@Controller('api/equipment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new equipment entry' })
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search equipment by any field (tag, service, material, notes)' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  search(@Query('q') q: string) {
    return this.equipmentService.search(q);
  }

  @Get('tag/:tagNumber')
  @ApiOperation({ summary: 'Get equipment by tag number' })
  findByTag(@Param('tagNumber') tagNumber: string) {
    return this.equipmentService.findByTag(tagNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID (includes recent discussions)' })
  findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all equipment with optional filters' })
  findAll(@Query() filter: EquipmentFilterDto) {
    return this.equipmentService.findAll(filter);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update equipment' })
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete equipment' })
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
}
