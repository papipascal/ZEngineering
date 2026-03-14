import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EmailRulesService } from './email-rules.service.js';
import { CreateEmailRuleDto } from './dto/create-email-rule.dto.js';
import { UpdateEmailRuleDto } from './dto/update-email-rule.dto.js';

@ApiTags('Email Routing Rules')
@Controller('api/email-rules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailRulesController {
  constructor(private readonly service: EmailRulesService) {}

  @Get()
  @ApiOperation({ summary: 'List all routing rules for a project' })
  @ApiQuery({ name: 'projectId', required: true })
  findAll(@Query('projectId') projectId: string) {
    return this.service.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single rule' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new routing rule' })
  create(@Body() dto: CreateEmailRuleDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a routing rule' })
  update(@Param('id') id: string, @Body() dto: UpdateEmailRuleDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle active state of a rule' })
  toggle(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a routing rule' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
