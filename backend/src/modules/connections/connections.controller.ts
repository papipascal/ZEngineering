import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ConnectionsService } from './connections.service.js';
import { CreateConnectionDto } from './dto/create-connection.dto.js';
import { UpdateConnectionDto } from './dto/update-connection.dto.js';
import { ConnectionFilterDto } from './dto/connection-filter.dto.js';

@ApiTags('connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/connections')
export class ConnectionsController {
  constructor(private readonly service: ConnectionsService) {}

  @Post()
  create(@Body() dto: CreateConnectionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() filter: ConnectionFilterDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConnectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
