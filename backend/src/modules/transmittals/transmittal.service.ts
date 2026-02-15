import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateTransmittalDto } from './dto/create-transmittal.dto.js';
import { UpdateTransmittalDto } from './dto/update-transmittal.dto.js';
import { TransmittalFilterDto } from './dto/transmittal-filter.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransmittalService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private storageService: StorageService,
  ) {}

  async findAll(filter: TransmittalFilterDto) {
    const where: Prisma.TransmittalWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.status) where.status = filter.status;
    if (filter.purpose) where.purpose = filter.purpose;
    if (filter.search) {
      where.OR = [
        { transmittalNumber: { contains: filter.search, mode: 'insensitive' } },
        { subject: { contains: filter.search, mode: 'insensitive' } },
        { recipientName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.transmittal.findMany({
      where,
      include: {
        sentBy: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
        partner: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transmittal = await this.prisma.transmittal.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, projectEmail: true } },
        sentBy: { select: { id: true, name: true, email: true } },
        vendor: { select: { id: true, name: true } },
        partner: { select: { id: true, name: true } },
        items: {
          include: {
            document: { select: { id: true, fileName: true, fileSize: true, s3Key: true } },
            registerEntry: { select: { id: true, documentNumber: true, title: true, revision: true } },
          },
        },
      },
    });
    if (!transmittal) throw new NotFoundException('Transmittal not found');
    return transmittal;
  }

  async create(dto: CreateTransmittalDto) {
    // Generate transmittal number
    const count = await this.prisma.transmittal.count({ where: { projectId: dto.projectId } });
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId }, select: { name: true } });
    const prefix = project?.name?.substring(0, 6).toUpperCase().replace(/\s+/g, '') || 'ZG';
    const transmittalNumber = `${prefix}-TR-${String(count + 1).padStart(3, '0')}`;

    const { items, ...data } = dto;
    return this.prisma.transmittal.create({
      data: {
        ...data,
        transmittalNumber,
        items: items?.length
          ? { create: items.map((item) => ({ ...item })) }
          : undefined,
      },
      include: {
        sentBy: { select: { id: true, name: true } },
        items: true,
      },
    });
  }

  async update(id: string, dto: UpdateTransmittalDto) {
    const existing = await this.prisma.transmittal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Transmittal not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT transmittals can be updated');
    }

    const { items, ...data } = dto;
    // If items are provided, replace all items
    if (items) {
      await this.prisma.transmittalItem.deleteMany({ where: { transmittalId: id } });
    }

    return this.prisma.transmittal.update({
      where: { id },
      data: {
        ...data,
        items: items?.length
          ? { create: items.map((item) => ({ ...item })) }
          : undefined,
      },
      include: {
        sentBy: { select: { id: true, name: true } },
        items: {
          include: {
            document: { select: { id: true, fileName: true, s3Key: true } },
            registerEntry: { select: { id: true, documentNumber: true, title: true, revision: true } },
          },
        },
      },
    });
  }

  async send(id: string) {
    const transmittal = await this.findOne(id);
    if (transmittal.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT transmittals can be sent');
    }
    if (transmittal.items.length === 0) {
      throw new BadRequestException('Transmittal must have at least one item');
    }

    // Generate presigned download URLs for documents
    const documents: Array<{ name: string; revision?: string; downloadUrl: string }> = [];
    for (const item of transmittal.items) {
      if (item.document) {
        const url = await this.storageService.getPresignedUrl(item.document.s3Key, 86400); // 24h
        documents.push({
          name: item.document.fileName,
          revision: item.registerEntry?.revision,
          downloadUrl: url,
        });
      } else if (item.registerEntry) {
        documents.push({
          name: `${item.registerEntry.documentNumber} - ${item.registerEntry.title}`,
          revision: item.registerEntry.revision,
          downloadUrl: '', // No file attached
        });
      }
    }

    // Send email
    const fromEmail = transmittal.project?.projectEmail || process.env.SMTP_FROM || 'noreply@zengineering.local';
    await this.mailService.sendTransmittal({
      from: fromEmail,
      to: transmittal.recipientEmail,
      subject: `[${transmittal.transmittalNumber}] ${transmittal.subject}`,
      transmittalNumber: transmittal.transmittalNumber,
      purpose: transmittal.purpose,
      coverLetter: transmittal.coverLetter ?? undefined,
      senderName: transmittal.sentBy.name,
      projectName: transmittal.project?.name || '',
      documents,
    });

    // Update status
    return this.prisma.transmittal.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
      include: {
        sentBy: { select: { id: true, name: true } },
        items: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.transmittal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Transmittal not found');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT transmittals can be deleted');
    }
    return this.prisma.transmittal.delete({ where: { id } });
  }
}
