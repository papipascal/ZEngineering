import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateConnectionDto } from './dto/create-connection.dto.js';
import { UpdateConnectionDto } from './dto/update-connection.dto.js';
import { ConnectionFilterDto } from './dto/connection-filter.dto.js';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConnectionDto) {
    return this.prisma.connection.create({
      data: dto,
      include: {
        fromEquipment: { select: { id: true, tagNumber: true, service: true } },
        toEquipment:   { select: { id: true, tagNumber: true, service: true } },
      },
    });
  }

  async findAll(filter: ConnectionFilterDto) {
    const where: Prisma.ConnectionWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.type) where.type = filter.type;
    if (filter.equipmentId) {
      where.OR = [
        { fromEquipmentId: filter.equipmentId },
        { toEquipmentId:   filter.equipmentId },
      ];
    }
    if (filter.search) {
      where.OR = [
        { lineNumber:    { contains: filter.search, mode: 'insensitive' } },
        { fluid:         { contains: filter.search, mode: 'insensitive' } },
        { materialSpec:  { contains: filter.search, mode: 'insensitive' } },
        { notes:         { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.connection.findMany({
      where,
      include: {
        fromEquipment: { select: { id: true, tagNumber: true, service: true } },
        toEquipment:   { select: { id: true, tagNumber: true, service: true } },
      },
      orderBy: { lineNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const conn = await this.prisma.connection.findUnique({
      where: { id },
      include: {
        fromEquipment: true,
        toEquipment:   true,
      },
    });
    if (!conn) throw new NotFoundException(`Connection ${id} not found`);
    return conn;
  }

  async update(id: string, dto: UpdateConnectionDto) {
    await this.findOne(id);
    return this.prisma.connection.update({
      where: { id },
      data: dto,
      include: {
        fromEquipment: { select: { id: true, tagNumber: true, service: true } },
        toEquipment:   { select: { id: true, tagNumber: true, service: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.connection.delete({ where: { id } });
  }
}
