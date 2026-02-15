import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TransmittalService } from './transmittal.service.js';
import { CreateTransmittalDto } from './dto/create-transmittal.dto.js';
import { UpdateTransmittalDto } from './dto/update-transmittal.dto.js';
import { TransmittalFilterDto } from './dto/transmittal-filter.dto.js';

@ApiTags('Transmittals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/transmittals')
export class TransmittalController {
  constructor(private readonly service: TransmittalService) {}

  @Get()
  findAll(@Query() filter: TransmittalFilterDto) {
    return this.service.findAll(filter);
  }

  @Post()
  create(@Body() dto: CreateTransmittalDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransmittalDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.service.send(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
