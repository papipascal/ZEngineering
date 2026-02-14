import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateChangeRequestDto } from './dto/create-change-request.dto.js';

@Injectable()
export class ChangeRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(requesterId: string, dto: CreateChangeRequestDto) {
    // Verify equipment exists and get current value
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: dto.equipmentId },
      include: { project: true },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    // Get current field value
    const currentValue = (equipment as Record<string, unknown>)[dto.fieldName];
    if (currentValue === undefined) {
      throw new BadRequestException(`Field "${dto.fieldName}" does not exist on equipment`);
    }

    // Find the "Simple Approval" workflow definition
    const definition = await this.prisma.workflowDefinition.findFirst({
      where: { name: { contains: 'Simple Approval', mode: 'insensitive' } },
    });
    if (!definition) {
      throw new BadRequestException('No "Simple Approval" workflow definition found. Please seed the database.');
    }

    // Start workflow instance
    const stepDefs = definition.steps as Array<{ name: string; order: number }>;
    const instance = await this.prisma.workflowInstance.create({
      data: {
        definitionId: definition.id,
        projectId: equipment.projectId,
        context: {
          changeRequestType: 'equipment_field',
          equipmentId: dto.equipmentId,
          fieldName: dto.fieldName,
          newValue: dto.newValue,
        },
        status: 'running',
        currentStepIdx: 0,
        steps: {
          create: stepDefs.map((s, idx) => ({
            name: s.name,
            order: s.order,
            status: idx === 0 ? 'active' : 'pending',
            startedAt: idx === 0 ? new Date() : null,
          })),
        },
      },
    });

    // Create change request linked to the workflow
    const changeRequest = await this.prisma.changeRequest.create({
      data: {
        equipmentId: dto.equipmentId,
        requesterId,
        fieldName: dto.fieldName,
        oldValue: currentValue != null ? String(currentValue) : null,
        newValue: dto.newValue,
        justification: dto.justification,
        status: 'PENDING',
        workflowInstanceId: instance.id,
      },
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
        requester: { select: { id: true, name: true, email: true } },
        workflowInstance: {
          include: { steps: { orderBy: { order: 'asc' } } },
        },
      },
    });

    return changeRequest;
  }

  async findAll(projectId?: string) {
    const where = projectId
      ? { equipment: { projectId } }
      : {};

    return this.prisma.changeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
        requester: { select: { id: true, name: true } },
        workflowInstance: {
          select: { id: true, status: true, currentStepIdx: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const cr = await this.prisma.changeRequest.findUnique({
      where: { id },
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
        requester: { select: { id: true, name: true, email: true } },
        workflowInstance: {
          include: {
            steps: { orderBy: { order: 'asc' } },
            definition: { select: { name: true } },
          },
        },
      },
    });
    if (!cr) throw new NotFoundException('Change request not found');
    return cr;
  }

  /**
   * Called by workflow engine when a workflow completes or fails.
   * Applies the equipment change if approved, or marks as rejected.
   */
  async resolveByWorkflow(workflowInstanceId: string, approved: boolean) {
    const cr = await this.prisma.changeRequest.findUnique({
      where: { workflowInstanceId },
    });
    if (!cr) return; // Not a change-request workflow, nothing to do

    if (approved) {
      // Apply the change to the equipment
      const updateData: Record<string, unknown> = {};
      // Determine if the field is numeric
      const numericFields = [
        'operatingPressure', 'operatingTemperature',
        'designPressure', 'designTemperature',
        'estimatedWeight', 'quantity',
      ];
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
