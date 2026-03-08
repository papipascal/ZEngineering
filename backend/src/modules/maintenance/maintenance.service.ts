import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto.js';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto.js';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintenancePlanDto) {
    return this.prisma.maintenancePlan.create({
      data: {
        ...dto,
        lastPerformedAt: dto.lastPerformedAt ? new Date(dto.lastPerformedAt) : undefined,
        nextDueAt:       dto.nextDueAt       ? new Date(dto.nextDueAt)       : undefined,
      },
      include: { equipment: { select: { id: true, tagNumber: true, service: true } } },
    });
  }

  async findAll(filter: { equipmentId?: string; frequency?: string }) {
    return this.prisma.maintenancePlan.findMany({
      where: {
        ...(filter.equipmentId ? { equipmentId: filter.equipmentId } : {}),
        ...(filter.frequency   ? { frequency: filter.frequency as any } : {}),
      },
      include: { equipment: { select: { id: true, tagNumber: true, service: true } } },
      orderBy: { nextDueAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.maintenancePlan.findUnique({
      where: { id },
      include: { equipment: true },
    });
    if (!plan) throw new NotFoundException(`MaintenancePlan ${id} not found`);
    return plan;
  }

  async update(id: string, dto: UpdateMaintenancePlanDto) {
    await this.findOne(id);
    return this.prisma.maintenancePlan.update({
      where: { id },
      data: {
        ...dto,
        lastPerformedAt: dto.lastPerformedAt ? new Date(dto.lastPerformedAt) : undefined,
        nextDueAt:       dto.nextDueAt       ? new Date(dto.nextDueAt)       : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.maintenancePlan.delete({ where: { id } });
  }
}
