import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get project overview stats (all counts)' })
  getProjectStats(@Param('projectId') projectId: string) {
    return this.dashboardService.getProjectStats(projectId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user dashboard (my tasks, unread emails, recent activity)' })
  @ApiQuery({ name: 'projectId', required: false })
  getUserDashboard(
    @Param('userId') userId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.dashboardService.getUserDashboard(userId, projectId);
  }

  @Get('project/:projectId/equipment')
  @ApiOperation({ summary: 'Equipment stats by category + pending changes' })
  getEquipmentStats(@Param('projectId') projectId: string) {
    return this.dashboardService.getEquipmentStats(projectId);
  }

  @Get('project/:projectId/documents')
  @ApiOperation({ summary: 'Document register stats by status and discipline' })
  getDocumentStats(@Param('projectId') projectId: string) {
    return this.dashboardService.getDocumentStats(projectId);
  }

  @Get('project/:projectId/workflows')
  @ApiOperation({ summary: 'Workflow stats per definition (running/completed/failed)' })
  getWorkflowStats(@Param('projectId') projectId: string) {
    return this.dashboardService.getWorkflowStats(projectId);
  }
}
