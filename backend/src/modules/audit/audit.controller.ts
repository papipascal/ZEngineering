import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AuditService } from './audit.service.js';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get audit trail for a project' })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  getProjectAudit(
    @Param('projectId') projectId: string,
    @Query('entity') entity?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.auditService.findByProject(projectId, {
      entity,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('entity/:entity/:entityId')
  @ApiOperation({ summary: 'Get audit history for a specific entity' })
  getEntityAudit(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entity, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit trail for a user' })
  @ApiQuery({ name: 'limit', required: false })
  getUserAudit(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByUser(userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
