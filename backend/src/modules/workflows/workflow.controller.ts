import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { WorkflowService } from './workflow.service.js';
import { CreateDefinitionDto } from './dto/create-definition.dto.js';
import { StartWorkflowDto } from './dto/start-workflow.dto.js';
import { CompleteStepDto } from './dto/complete-step.dto.js';

@ApiTags('Workflows')
@Controller('api/workflows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // ==========================================
  // Definitions
  // ==========================================

  @Post('definitions')
  @ApiOperation({ summary: 'Create a workflow definition (template)' })
  createDefinition(@Body() dto: CreateDefinitionDto) {
    return this.workflowService.createDefinition(dto);
  }

  @Get('definitions')
  @ApiOperation({ summary: 'List all workflow definitions' })
  listDefinitions() {
    return this.workflowService.listDefinitions();
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get a workflow definition by ID' })
  getDefinition(@Param('id') id: string) {
    return this.workflowService.getDefinition(id);
  }

  // ==========================================
  // Instances
  // ==========================================

  @Post('instances')
  @ApiOperation({ summary: 'Start a new workflow instance' })
  startWorkflow(@Body() dto: StartWorkflowDto) {
    return this.workflowService.startWorkflow(dto);
  }

  @Get('instances')
  @ApiOperation({ summary: 'List workflow instances' })
  @ApiQuery({ name: 'projectId', required: false })
  listInstances(@Query('projectId') projectId?: string) {
    return this.workflowService.listInstances(projectId);
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Get workflow instance status' })
  getInstance(@Param('id') id: string) {
    return this.workflowService.getInstance(id);
  }

  // ==========================================
  // Step Completion
  // ==========================================

  @Post('instances/:instanceId/steps/:stepId/complete')
  @ApiOperation({ summary: 'Complete a workflow step (approve/reject/complete/skip)' })
  completeStep(
    @Param('instanceId') instanceId: string,
    @Param('stepId') stepId: string,
    @Body() dto: CompleteStepDto,
  ) {
    return this.workflowService.completeStep(instanceId, stepId, dto);
  }

  // ==========================================
  // Tasks
  // ==========================================

  @Get('tasks/active')
  @ApiOperation({ summary: 'Get all active (pending) tasks' })
  getActiveTasks() {
    return this.workflowService.getActiveTasks();
  }

  @Get('tasks/my/:userId')
  @ApiOperation({ summary: 'Get pending tasks for a specific user' })
  getMyTasks(@Param('userId') userId: string) {
    return this.workflowService.getMyTasks(userId);
  }
}
