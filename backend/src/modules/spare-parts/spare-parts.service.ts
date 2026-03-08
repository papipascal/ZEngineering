import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SparePartCriticality } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSparePartDto } from './dto/create-spare-part.dto.js';
import { UpdateSparePartDto } from './dto/update-spare-part.dto.js';

@Injectable()
export class SparePartsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSparePartDto) {
    return this.prisma.sparePart.create({
      data: dto,
      include: { equipment: { select: { id: true, tagNumber: true, service: true } } },
    });
  }

  async findByEquipment(equipmentId: string, criticality?: SparePartCriticality) {
    const where: Prisma.SparePartWhereInput = { equipmentId };
    if (criticality) where.criticality = criticality;
    return this.prisma.sparePart.findMany({
      where,
      include: { document: { select: { id: true, fileName: true } } },
      orderBy: [{ criticality: 'asc' }, { partNumber: 'asc' }],
    });
  }

  async findAll(filter: { equipmentId?: string; criticality?: SparePartCriticality; search?: string }) {
    const where: Prisma.SparePartWhereInput = {};
    if (filter.equipmentId) where.equipmentId = filter.equipmentId;
    if (filter.criticality) where.criticality = filter.criticality;
    if (filter.search) {
      where.OR = [
        { partNumber:   { contains: filter.search, mode: 'insensitive' } },
        { description:  { contains: filter.search, mode: 'insensitive' } },
        { manufacturer: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.sparePart.findMany({
      where,
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
        document:  { select: { id: true, fileName: true } },
      },
      orderBy: [{ criticality: 'asc' }, { partNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const sp = await this.prisma.sparePart.findUnique({
      where: { id },
      include: {
        equipment: true,
        document:  true,
      },
    });
    if (!sp) throw new NotFoundException(`SparePart ${id} not found`);
    return sp;
  }

  async update(id: string, dto: UpdateSparePartDto) {
    await this.findOne(id);
    return this.prisma.sparePart.update({
      where: { id },
      data: dto,
      include: {
        equipment: { select: { id: true, tagNumber: true, service: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sparePart.delete({ where: { id } });
  }
}
