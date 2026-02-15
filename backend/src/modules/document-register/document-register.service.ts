import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRegisterEntryDto } from './dto/create-register-entry.dto.js';
import { UpdateRegisterEntryDto } from './dto/update-register-entry.dto.js';
import { RegisterFilterDto } from './dto/register-filter.dto.js';

const ENTRY_INCLUDE = {
  owner: { select: { id: true, name: true, email: true, discipline: true } },
  issuer: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } },
};

@Injectable()
export class DocumentRegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: RegisterFilterDto) {
    const where: Prisma.DocumentRegisterEntryWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.discipline) where.discipline = filter.discipline;
    if (filter.status) where.status = filter.status;
    if (filter.ownerId) where.ownerId = filter.ownerId;
    if (filter.search) {
      where.OR = [
        { documentNumber: { contains: filter.search, mode: 'insensitive' } },
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.documentRegisterEntry.findMany({
      where,
      orderBy: { documentNumber: 'asc' },
      include: ENTRY_INCLUDE,
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.documentRegisterEntry.findUnique({
      where: { id },
      include: {
        ...ENTRY_INCLUDE,
        revisions: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!entry) throw new NotFoundException(`Document register entry ${id} not found`);
    return entry;
  }

  async create(dto: CreateRegisterEntryDto) {
    return this.prisma.documentRegisterEntry.create({
      data: {
        projectId: dto.projectId,
        documentNumber: dto.documentNumber,
        title: dto.title,
        discipline: dto.discipline,
        ownerId: dto.ownerId,
        issuerId: dto.issuerId,
        revision: dto.revision ?? 'A',
        status: dto.status ?? 'DRAFT',
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        description: dto.description,
      },
      include: ENTRY_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateRegisterEntryDto) {
    await this.findOne(id);
    const data: Prisma.DocumentRegisterEntryUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.discipline !== undefined) data.discipline = dto.discipline;
    if (dto.revision !== undefined) data.revision = dto.revision;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.issueDate !== undefined) data.issueDate = dto.issueDate ? new Date(dto.issueDate) : null;
    if (dto.ownerId !== undefined) data.owner = { connect: { id: dto.ownerId } };
    if (dto.issuerId !== undefined) {
      data.issuer = dto.issuerId ? { connect: { id: dto.issuerId } } : { disconnect: true };
    }
    return this.prisma.documentRegisterEntry.update({
      where: { id },
      data,
      include: ENTRY_INCLUDE,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.documentRegisterEntry.delete({ where: { id } });
  }
}
