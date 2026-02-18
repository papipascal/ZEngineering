import { Injectable, NotFoundException, BadRequestException, Optional, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDefinitionDto } from './dto/create-definition.dto.js';
import { StartWorkflowDto } from './dto/start-workflow.dto.js';
import { CompleteStepDto } from './dto/complete-step.dto.js';
import { NotificationService } from '../notifications/notification.service.js';

interface StepDef {
  name: string;
  order: number;
  type: string;
  assigneeRole?: string;
}

/** Maps workflow assigneeRole values to ProjectOrganization role keys */
const ROLE_TO_ORG_MAPPING: Record<string, string[]> = {
  lead: [
    'process_lead', 'layout_lead', 'civil_lead', 'piping_lead',
    'vessels_lead', 'machine_lead', 'electrical_lead', 'instrument_lead',
    'engineering_manager',
  ],
  chef_de_projet: ['chef_de_projet'],
  manager: ['chef_de_projet', 'engineering_manager', 'procurement_manager', 'construction_manager'],
  admin: ['sponsor', 'chef_de_projet'],
  member: [], // members are not auto-resolved from org chart
};

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly notifications?: NotificationService,
  ) {}

  // ==========================================
  // Definitions
  // ==========================================

  async createDefinition(dto: CreateDefinitionDto) {
    return this.prisma.workflowDefinition.create({
      data: {
        name: dto.name,
        description: dto.description,
        steps: JSON.parse(JSON.stringify(dto.steps)) as Prisma.InputJsonValue,
        transitions: JSON.parse(JSON.stringify(dto.transitions)) as Prisma.InputJsonValue,
      },
    });
  }

  async listDefinitions() {
    return this.prisma.workflowDefinition.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDefinition(id: string) {
    const def = await this.prisma.workflowDefinition.findUnique({
      where: { id },
      include: { instances: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
    if (!def) throw new NotFoundException(`Definition ${id} not found`);
    return def;
  }

  // ==========================================
  // Instances
  // ==========================================

  async startWorkflow(dto: StartWorkflowDto) {
    const definition = await this.prisma.workflowDefinition.findUnique({
      where: { id: dto.definitionId },
    });
    if (!definition) {
      throw new NotFoundException(`Definition ${dto.definitionId} not found`);
    }

    const stepDefs = definition.steps as unknown as StepDef[];

    // Auto-resolve assignees from ProjectOrganization
    const assigneeMap = dto.projectId
      ? await this.resolveAssigneesFromOrg(dto.projectId, stepDefs)
      : new Map<number, string>();

    // Create instance with all steps
    const instance = await this.prisma.workflowInstance.create({
      data: {
        definitionId: dto.definitionId,
        projectId: dto.projectId,
        context: dto.context
          ? (JSON.parse(JSON.stringify(dto.context)) as Prisma.InputJsonValue)
          : undefined,
        status: 'running',
        currentStepIdx: 0,
        steps: {
          create: stepDefs.map((s, idx) => ({
            name: s.name,
            order: s.order,
            status: idx === 0 ? 'active' : 'pending',
            startedAt: idx === 0 ? new Date() : null,
            assigneeId: assigneeMap.get(s.order) ?? null,
          })),
        },
      },
      include: {
        steps: { orderBy: { order: 'asc' } },
        definition: { select: { name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Notify first step assignee
    const firstStep = instance.steps[0];
    if (firstStep?.assigneeId && this.notifications) {
      this.notifications.notifyWorkflowAssigned({
        userId: firstStep.assigneeId,
        projectId: dto.projectId ?? '',
        workflowName: instance.definition.name,
        stepName: firstStep.name,
        instanceId: instance.id,
      });
    }

    return instance;
  }

  async getInstance(id: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: { assignee: { select: { id: true, name: true, email: true } } },
        },
        definition: true,
        project: true,
      },
    });
    if (!instance) throw new NotFoundException(`Instance ${id} not found`);
    return instance;
  }

  async listInstances(projectId?: string) {
    return this.prisma.workflowInstance.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        definition: { select: { name: true } },
        steps: {
          orderBy: { order: 'asc' },
          include: { assignee: { select: { id: true, name: true } } },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  // ==========================================
  // Step Completion (State Machine Core)
  // ==========================================

  async completeStep(instanceId: string, stepId: string, dto: CompleteStepDto) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        steps: { orderBy: { order: 'asc' } },
        definition: { select: { name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!instance) throw new NotFoundException(`Instance ${instanceId} not found`);
    if (instance.status !== 'running') {
      throw new BadRequestException(`Workflow is ${instance.status}, not running`);
    }

    const step = instance.steps.find((s) => s.id === stepId);
    if (!step) throw new NotFoundException(`Step ${stepId} not found`);
    if (step.status !== 'active') {
      throw new BadRequestException(`Step "${step.name}" is ${step.status}, not active`);
    }

    const now = new Date();

    // Complete current step
    await this.prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: dto.action === 'reject' ? 'rejected' : 'completed',
        action: dto.action,
        comment: dto.comment,
        assigneeId: dto.assigneeId,
        completedAt: now,
      },
    });

    // Handle rejection: cancel the workflow
    if (dto.action === 'reject') {
      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'failed', completedAt: now },
      });
      await this.resolveChangeRequest(instanceId, false);

      if (this.notifications && instance.projectId) {
        this.notifications.notifyWorkflowRejected({
          projectId: instance.projectId,
          workflowName: instance.definition.name,
          instanceId,
          stepName: step.name,
        });
      }

      return this.getInstance(instanceId);
    }

    // Advance to next step
    const nextStepIdx = step.order + 1;
    const nextStep = instance.steps.find((s) => s.order === nextStepIdx);

    if (nextStep) {
      // Activate next step
      await this.prisma.workflowStep.update({
        where: { id: nextStep.id },
        data: { status: 'active', startedAt: now },
      });
      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStepIdx: nextStepIdx },
      });

      // Notify next step assignee
      if (nextStep.assigneeId && this.notifications && instance.projectId) {
        this.notifications.notifyWorkflowAssigned({
          userId: nextStep.assigneeId,
          projectId: instance.projectId,
          workflowName: instance.definition.name,
          stepName: nextStep.name,
          instanceId,
        });
      }
    } else {
      // No more steps: workflow complete
      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'completed', completedAt: now },
      });
      await this.resolveChangeRequest(instanceId, true);

      if (this.notifications && instance.projectId) {
        this.notifications.notifyWorkflowCompleted({
          projectId: instance.projectId,
          workflowName: instance.definition.name,
          instanceId,
        });
      }
    }

    return this.getInstance(instanceId);
  }

  // ==========================================
  // Task queries
  // ==========================================

  async getMyTasks(userId: string) {
    return this.prisma.workflowStep.findMany({
      where: {
        assigneeId: userId,
        status: 'active',
      },
      include: {
        instance: {
          include: {
            definition: { select: { name: true } },
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });
  }

  async getActiveTasks() {
    return this.prisma.workflowStep.findMany({
      where: { status: 'active' },
      include: {
        instance: {
          include: {
            definition: { select: { name: true } },
            project: { select: { name: true } },
          },
        },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startedAt: 'asc' },
    });
  }

  // ==========================================
  // Auto-assignment from ProjectOrganization
  // ==========================================

  private async resolveAssigneesFromOrg(
    projectId: string,
    stepDefs: StepDef[],
  ): Promise<Map<number, string>> {
    const assigneeMap = new Map<number, string>();

    const orgPositions = await this.prisma.projectOrganization.findMany({
      where: { projectId, userId: { not: null } },
      select: { role: true, userId: true },
    });

    if (orgPositions.length === 0) return assigneeMap;

    for (const stepDef of stepDefs) {
      if (!stepDef.assigneeRole) continue;

      const orgRoles = ROLE_TO_ORG_MAPPING[stepDef.assigneeRole];
      if (!orgRoles || orgRoles.length === 0) continue;

      // Find first matching org position with an assigned user
      for (const orgRole of orgRoles) {
        const pos = orgPositions.find((p) => p.role === orgRole && p.userId);
        if (pos?.userId) {
          assigneeMap.set(stepDef.order, pos.userId);
          break;
        }
      }
    }

    return assigneeMap;
  }

  // ==========================================
  // Change Request Resolution
  // ==========================================

  private async resolveChangeRequest(workflowInstanceId: string, approved: boolean) {
    const cr = await this.prisma.changeRequest.findUnique({
      where: { workflowInstanceId },
    });
    if (!cr) return; // Not linked to a change request

    if (approved) {
      const numericFields = [
        'operatingPressure', 'operatingTemperature',
        'designPressure', 'designTemperature',
        'estimatedWeight', 'quantity',
      ];
      const updateData: Record<string, unknown> = {};
      if (numericFields.includes(cr.fieldName)) {
        updateData[cr.fieldName] = parseFloat(cr.newValue);
      } else {
        updateData[cr.fieldName] = cr.newValue;
      }

      await this.prisma.equipment.update({
        where: { id: cr.equipmentId },
        data: updateData,
      });
      await this.prisma.changeRequest.update({
        where: { id: cr.id },
        data: { status: 'APPROVED' },
      });
    } else {
      await this.prisma.changeRequest.update({
        where: { id: cr.id },
        data: { status: 'REJECTED' },
      });
    }
  }
}
