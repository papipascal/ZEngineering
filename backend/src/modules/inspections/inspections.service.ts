import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateInspectionDto } from './dto/create-inspection.dto.js';
import { UpdateInspectionDto } from './dto/update-inspection.dto.js';

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInspectionDto) {
    return this.prisma.inspectionRecord.create({
      data: {
        ...dto,
        inspectionDate:     new Date(dto.inspectionDate),
        nextInspectionDate: dto.nextInspectionDate ? new Date(dto.nextInspectionDate) : undefined,
      },
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
        user:      { select: { id: true, name: true } },
      },
    });
  }

  async findAll(filter: { equipmentId?: string; type?: string; result?: string }) {
    const where: Prisma.InspectionRecordWhereInput = {};
    if (filter.equipmentId) where.equipmentId = filter.equipmentId;
    if (filter.type)   where.type   = filter.type as any;
    if (filter.result) where.result = filter.result as any;

    return this.prisma.inspectionRecord.findMany({
      where,
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
        user:      { select: { id: true, name: true } },
        document:  { select: { id: true, fileName: true } },
      },
      orderBy: { inspectionDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.inspectionRecord.findUnique({
      where: { id },
      include: {
        equipment: true,
        user:      true,
        document:  true,
      },
    });
    if (!record) throw new NotFoundException(`InspectionRecord ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateInspectionDto) {
    await this.findOne(id);
    return this.prisma.inspectionRecord.update({
      where: { id },
      data: {
        ...dto,
        inspectionDate:     dto.inspectionDate     ? new Date(dto.inspectionDate)     : undefined,
        nextInspectionDate: dto.nextInspectionDate ? new Date(dto.nextInspectionDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inspectionRecord.delete({ where: { id } });
  }
}
