import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectStats(projectId: string) {
    const [
      equipmentCount,
      activeWorkflows,
      completedWorkflows,
      failedWorkflows,
      pendingTasks,
      unreadEmails,
      totalEmails,
      documentsCount,
      registerEntries,
      transmittals,
      discussions,
      changeRequests,
      contractItems,
      orgPositions,
    ] = await Promise.all([
      this.prisma.equipment.count({ where: { projectId } }),
      this.prisma.workflowInstance.count({ where: { projectId, status: 'running' } }),
      this.prisma.workflowInstance.count({ where: { projectId, status: 'completed' } }),
      this.prisma.workflowInstance.count({ where: { projectId, status: 'failed' } }),
      this.prisma.workflowStep.count({
        where: { status: 'active', instance: { projectId } },
      }),
      this.prisma.incomingEmail.count({ where: { projectId, status: 'UNREAD' } }),
      this.prisma.incomingEmail.count({ where: { projectId } }),
      this.prisma.document.count({ where: { projectId } }),
      this.prisma.documentRegisterEntry.count({ where: { projectId } }),
      this.prisma.transmittal.count({ where: { projectId } }),
      this.prisma.discussion.count({ where: { projectId } }),
      this.prisma.changeRequest.count({
        where: { equipment: { projectId }, status: 'PENDING' },
      }),
      this.prisma.contractItem.count({ where: { projectId } }),
      this.prisma.projectOrganization.count({ where: { projectId } }),
    ]);

    return {
      equipment: { total: equipmentCount },
      workflows: {
        active: activeWorkflows,
        completed: completedWorkflows,
        failed: failedWorkflows,
        pendingTasks,
      },
      emails: { unread: unreadEmails, total: totalEmails },
      documents: { uploaded: documentsCount, registered: registerEntries },
      transmittals: { total: transmittals },
      discussions: { total: discussions },
      changeRequests: { pending: changeRequests },
      contractItems: { total: contractItems },
      organization: { positions: orgPositions },
    };
  }

  async getUserDashboard(userId: string, projectId?: string) {
    const taskWhere: any = { status: 'active', assigneeId: userId };
    if (projectId) taskWhere.instance = { projectId };

    const [myTasks, myUnreadEmails, recentActivity] = await Promise.all([
      this.prisma.workflowStep.findMany({
        where: taskWhere,
        include: {
          instance: {
            include: {
              definition: { select: { name: true } },
              project: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { startedAt: 'asc' },
        take: 20,
      }),
      this.prisma.incomingEmail.count({
        where: {
          assignedToId: userId,
          status: 'UNREAD',
          ...(projectId ? { projectId } : {}),
        },
      }),
      this.prisma.workflowStep.findMany({
        where: {
          status: { in: ['completed', 'rejected'] },
          instance: projectId ? { projectId } : undefined,
        },
        include: {
          assignee: { select: { id: true, name: true } },
          instance: {
            include: {
              definition: { select: { name: true } },
              project: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      myTasks,
      myUnreadEmails,
      recentActivity,
    };
  }

  async getEquipmentStats(projectId: string) {
    const byCategory = await this.prisma.equipment.groupBy({
      by: ['category'],
      where: { projectId },
      _count: true,
    });

    const withChangeRequests = await this.prisma.equipment.findMany({
      where: {
        projectId,
        changeRequests: { some: { status: 'PENDING' } },
      },
      select: {
        id: true,
        tagNumber: true,
        service: true,
        _count: { select: { changeRequests: true } },
      },
    });

    return { byCategory, withPendingChanges: withChangeRequests };
  }

  async getDocumentStats(projectId: string) {
    const byStatus = await this.prisma.documentRegisterEntry.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true,
    });

    const byDiscipline = await this.prisma.documentRegisterEntry.groupBy({
      by: ['discipline'],
      where: { projectId },
      _count: true,
    });

    return { byStatus, byDiscipline };
  }

  async getWorkflowStats(projectId: string) {
    const definitions = await this.prisma.workflowDefinition.findMany({
      include: {
        _count: {
          select: { instances: true },
        },
        instances: {
          where: { projectId },
          select: { status: true },
        },
      },
    });

    return definitions.map((def) => ({
      id: def.id,
      name: def.name,
      totalInstances: def.instances.length,
      byStatus: {
        running: def.instances.filter((i) => i.status === 'running').length,
        completed: def.instances.filter((i) => i.status === 'completed').length,
        failed: def.instances.filter((i) => i.status === 'failed').length,
      },
    }));
  }
}
