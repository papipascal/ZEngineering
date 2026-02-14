import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChangeRequestService } from './change-request.service.js';
import { CreateChangeRequestDto } from './dto/create-change-request.dto.js';

@ApiTags('Change Requests')
@Controller('api/change-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChangeRequestController {
  constructor(private readonly changeRequestService: ChangeRequestService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a change request (starts approval workflow)' })
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateChangeRequestDto,
  ) {
    return this.changeRequestService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all change requests' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query('projectId') projectId?: string) {
    return this.changeRequestService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get change request details' })
  findOne(@Param('id') id: string) {
    return this.changeRequestService.findOne(id);
  }
}
