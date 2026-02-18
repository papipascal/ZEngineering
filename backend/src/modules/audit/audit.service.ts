import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface AuditEntry {
  projectId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget audit log entry */
  log(entry: AuditEntry) {
    this.prisma.auditLog
      .create({
        data: {
          projectId: entry.projectId,
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          summary: entry.summary,
          changes: entry.changes
            ? (JSON.parse(JSON.stringify(entry.changes)) as Prisma.InputJsonValue)
            : undefined,
        },
      })
      .catch(() => {
        // Audit logging should never break the main flow
      });
  }

  async findByProject(projectId: string, options?: { entity?: string; limit?: number; offset?: number }) {
    return this.prisma.auditLog.findMany({
      where: {
        projectId,
        ...(options?.entity ? { entity: options.entity } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string, options?: { limit?: number }) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 50,
    });
  }
}
