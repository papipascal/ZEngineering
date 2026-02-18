import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GlobalSearchDto } from './dto/global-search.dto.js';
import { SaveSearchDto } from './dto/save-search.dto.js';

const MAX_PER_ENTITY = 50;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: GlobalSearchDto, userId: string) {
    const types = dto.entityTypes?.length
      ? dto.entityTypes
      : ['documents', 'transmittals', 'emails', 'equipment', 'discussions', 'register'];

    const dateFrom = dto.dateFrom ? new Date(dto.dateFrom) : undefined;
    const dateTo = dto.dateTo ? new Date(dto.dateTo) : undefined;

    const [documents, transmittals, emails, equipment, discussions, register] =
      await Promise.all([
        types.includes('documents') ? this.searchDocuments(dto, dateFrom, dateTo) : [],
        types.includes('transmittals') ? this.searchTransmittals(dto, dateFrom, dateTo) : [],
        types.includes('emails') ? this.searchEmails(dto, dateFrom, dateTo) : [],
        types.includes('equipment') ? this.searchEquipment(dto) : [],
        types.includes('discussions') ? this.searchDiscussions(dto, dateFrom, dateTo) : [],
        types.includes('register') ? this.searchRegister(dto, dateFrom, dateTo) : [],
      ]);

    const totalCount =
      documents.length + transmittals.length + emails.length +
      equipment.length + discussions.length + register.length;

    // Log the search (fire-and-forget)
    if (dto.query || Object.keys(dto).length > 1) {
      this.prisma.searchQuery.create({
        data: {
          projectId: dto.projectId,
          userId,
          query: dto.query || '',
          filters: dto as unknown as Prisma.JsonObject,
        },
      }).catch(() => {});
    }

    return { documents, transmittals, emails, equipment, discussions, register, totalCount };
  }

  private async searchDocuments(dto: GlobalSearchDto, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.DocumentWhereInput = { projectId: dto.projectId };
    if (dto.query) {
      where.OR = [
        { fileName: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    if (dto.category) where.category = dto.category as any;
    if (dto.folder) where.folder = dto.folder as any;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }
    if (dto.companyName) {
      where.vendor = { name: { contains: dto.companyName, mode: 'insensitive' } };
    }
    if (dto.equipmentTag) {
      where.equipment = { tagNumber: { contains: dto.equipmentTag, mode: 'insensitive' } };
    }
    return this.prisma.document.findMany({
      where,
      take: MAX_PER_ENTITY,
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        equipment: { select: { id: true, tagNumber: true } },
        vendor: { select: { id: true, name: true } },
      },
    });
  }

  private async searchTransmittals(dto: GlobalSearchDto, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.TransmittalWhereInput = { projectId: dto.projectId };
    if (dto.query) {
      where.OR = [
        { transmittalNumber: { contains: dto.query, mode: 'insensitive' } },
        { subject: { contains: dto.query, mode: 'insensitive' } },
        { recipientName: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    if (dto.status) where.status = dto.status as any;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }
    if (dto.companyName) {
      where.OR = [
        ...(where.OR || []),
        { recipientName: { contains: dto.companyName, mode: 'insensitive' } },
      ];
    }
    return this.prisma.transmittal.findMany({
      where,
      take: MAX_PER_ENTITY,
      orderBy: { createdAt: 'desc' },
      include: {
        sentBy: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
        partner: { select: { id: true, name: true } },
      },
    });
  }

  private async searchEmails(dto: GlobalSearchDto, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.IncomingEmailWhereInput = { projectId: dto.projectId };
    if (dto.query) {
      where.OR = [
        { subject: { contains: dto.query, mode: 'insensitive' } },
        { fromAddress: { contains: dto.query, mode: 'insensitive' } },
        { fromName: { contains: dto.query, mode: 'insensitive' } },
        { bodyText: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      where.receivedAt = {};
      if (dateFrom) where.receivedAt.gte = dateFrom;
      if (dateTo) where.receivedAt.lte = dateTo;
    }
    if (dto.companyName) {
      where.OR = [
        ...(where.OR || []),
        { fromName: { contains: dto.companyName, mode: 'insensitive' } },
        { fromAddress: { contains: dto.companyName, mode: 'insensitive' } },
      ];
    }
    return this.prisma.incomingEmail.findMany({
      where,
      take: MAX_PER_ENTITY,
      orderBy: { receivedAt: 'desc' },
      select: {
        id: true, subject: true, fromAddress: true, fromName: true,
        receivedAt: true, status: true, purpose: true, isExternal: true,
      },
    });
  }

  private async searchEquipment(dto: GlobalSearchDto) {
    const where: Prisma.EquipmentWhereInput = { projectId: dto.projectId };
    if (dto.query) {
      where.OR = [
        { tagNumber: { contains: dto.query, mode: 'insensitive' } },
        { service: { contains: dto.query, mode: 'insensitive' } },
        { subType: { contains: dto.query, mode: 'insensitive' } },
        { material: { contains: dto.query, mode: 'insensitive' } },
        { notes: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    if (dto.category) where.category = dto.category as any;
    if (dto.equipmentTag) {
      where.tagNumber = { contains: dto.equipmentTag, mode: 'insensitive' };
    }
    return this.prisma.equipment.findMany({
      where,
      take: MAX_PER_ENTITY,
      orderBy: { tagNumber: 'asc' },
      select: {
        id: true, tagNumber: true, service: true, category: true,
        subType: true, material: true, notes: true,
      },
    });
  }

  private async searchDiscussions(dto: GlobalSearchDto, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.DiscussionWhereInput = { projectId: dto.projectId };
    if (dto.query) {
      where.OR = [
        { title: { contains: dto.query, mode: 'insensitive' } },
        { content: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }
    if (dto.equipmentTag) {
      where.equipment = { tagNumber: { contains: dto.equipmentTag, mode: 'insensitive' } };
    }
    return this.prisma.discussion.findMany({
      where,
      take: MAX_PER_ENTITY,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
        equipment: { select: { id: true, tagNumber: true } },
      },
    });
  }

  private async searchRegister(dto: GlobalSearchDto, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.DocumentRegisterEntryWhereInput = { projectId: dto.projectId };
    if (dto.query) {
      where.OR = [
        { documentNumber: { contains: dto.query, mode: 'insensitive' } },
        { title: { contains: dto.query, mode: 'insensitive' } },
        { description: { contains: dto.query, mode: 'insensitive' } },
      ];
    }
    if (dto.discipline) where.discipline = dto.discipline as any;
    if (dto.status) where.status = dto.status as any;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }
    return this.prisma.documentRegisterEntry.findMany({
      where,
      take: MAX_PER_ENTITY,
      orderBy: { documentNumber: 'asc' },
      include: {
        owner: { select: { id: true, name: true } },
      },
    });
  }

  // ── Saved Searches ──

  async saveSearch(dto: SaveSearchDto, userId: string) {
    return this.prisma.searchQuery.create({
      data: {
        projectId: dto.projectId,
        userId,
        name: dto.name,
        query: dto.query,
        filters: dto.filters as Prisma.JsonObject ?? Prisma.JsonNull,
        pinned: dto.pinned ?? false,
      },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async listSavedSearches(projectId: string, userId: string) {
    return this.prisma.searchQuery.findMany({
      where: {
        projectId,
        name: { not: null },
        OR: [
          { pinned: true },
          { userId },
        ],
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async listRecentSearches(projectId: string, limit = 20) {
    return this.prisma.searchQuery.findMany({
      where: { projectId, name: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async deleteSearch(id: string, userId: string, userRole: string) {
    const search = await this.prisma.searchQuery.findUnique({ where: { id } });
    if (!search) throw new NotFoundException('Search not found');
    if (search.userId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Cannot delete another user\'s search');
    }
    return this.prisma.searchQuery.delete({ where: { id } });
  }

  async togglePin(id: string, userId: string) {
    const search = await this.prisma.searchQuery.findUnique({ where: { id } });
    if (!search) throw new NotFoundException('Search not found');
    return this.prisma.searchQuery.update({
      where: { id },
      data: { pinned: !search.pinned },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
