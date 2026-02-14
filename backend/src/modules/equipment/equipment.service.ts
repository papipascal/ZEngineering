import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { EquipmentFilterDto } from './dto/equipment-filter.dto.js';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEquipmentDto) {
    return this.prisma.equipment.create({ data: dto });
  }

  async findAll(filter: EquipmentFilterDto) {
    const where: Prisma.EquipmentWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.category) where.category = filter.category;
    if (filter.search) {
      where.OR = [
        { tagNumber: { contains: filter.search, mode: 'insensitive' } },
        { service: { contains: filter.search, mode: 'insensitive' } },
        { subType: { contains: filter.search, mode: 'insensitive' } },
        { notes: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.equipment.findMany({
      where,
      orderBy: { tagNumber: 'asc' },
      include: { project: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        discussions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true } } },
        },
        documents: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: { id: true, fileName: true, category: true, fileSize: true, mimeType: true, createdAt: true, uploadedBy: { select: { id: true, name: true } } },
        },
      },
    });
    if (!equipment) throw new NotFoundException(`Equipment ${id} not found`);
    return equipment;
  }

  async findByTag(tagNumber: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { tagNumber },
      include: {
        project: { select: { id: true, name: true } },
        discussions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true } } },
        },
        documents: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: { id: true, fileName: true, category: true, fileSize: true, mimeType: true, createdAt: true, uploadedBy: { select: { id: true, name: true } } },
        },
      },
    });
    if (!equipment) throw new NotFoundException(`Equipment with tag ${tagNumber} not found`);
    return equipment;
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.findOne(id);
    return this.prisma.equipment.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.equipment.delete({ where: { id } });
  }

  async search(query: string) {
    return this.prisma.equipment.findMany({
      where: {
        OR: [
          { tagNumber: { contains: query, mode: 'insensitive' } },
          { service: { contains: query, mode: 'insensitive' } },
          { subType: { contains: query, mode: 'insensitive' } },
          { material: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { tagNumber: 'asc' },
      include: { project: { select: { id: true, name: true } } },
    });
  }
}
