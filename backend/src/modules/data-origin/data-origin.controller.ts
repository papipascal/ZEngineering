import {
  Controller, Get, Post, Delete, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataOriginService } from './data-origin.service.js';
import { CreateDataOriginDto } from './dto/create-data-origin.dto.js';
import { FilterDataOriginDto } from './dto/filter-data-origin.dto.js';

@ApiTags('data-origins')
@Controller('api/data-origins')
export class DataOriginController {
  constructor(private readonly service: DataOriginService) {}

  @Post()
  @ApiOperation({ summary: 'Record a data origin (AGO) for an equipment field' })
  create(@Body() dto: CreateDataOriginDto, @Req() req: any) {
    const userId = req.user?.id ?? req.headers['x-user-id'] ?? 'system';
    return this.service.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List data origins with optional filters' })
  findAll(@Query() filter: FilterDataOriginDto) {
    return this.service.findAll(filter);
  }

  @Get('latest/:equipmentId')
  @ApiOperation({ summary: 'Get latest origin per field for an equipment item' })
  findLatestPerField(@Param('equipmentId') equipmentId: string) {
    return this.service.findLatestPerField(equipmentId);
  }

  @Get('staleness-check')
  @ApiOperation({ summary: 'Project-wide AGO staleness report' })
  checkStaleness(@Query('projectId') projectId: string) {
    return this.service.checkStaleness(projectId);
  }

  @Get('staleness-check/:equipmentId')
  @ApiOperation({ summary: 'AGO staleness check for one equipment item' })
  checkStalenessForEquipment(@Param('equipmentId') equipmentId: string) {
    return this.service.checkStalenessForEquipment(equipmentId);
  }

  @Get('history/:equipmentId/:fieldName')
  @ApiOperation({ summary: 'Get origin history for a specific field' })
  findByField(
    @Param('equipmentId') equipmentId: string,
    @Param('fieldName') fieldName: string,
  ) {
    return this.service.findByField(equipmentId, fieldName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an origin record' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id ?? req.headers['x-user-id'] ?? 'system';
    const userRole = req.user?.role ?? req.headers['x-user-role'] ?? 'member';
    return this.service.remove(id, userId, userRole);
  }
}
