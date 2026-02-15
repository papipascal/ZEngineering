import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IncomingEmailFilterDto } from './dto/incoming-email-filter.dto.js';
import { UpdateIncomingEmailDto } from './dto/update-incoming-email.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncomingEmailService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: IncomingEmailFilterDto) {
    const where: Prisma.IncomingEmailWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.status) where.status = filter.status;
    if (filter.search) {
      where.OR = [
        { subject: { contains: filter.search, mode: 'insensitive' } },
        { fromAddress: { contains: filter.search, mode: 'insensitive' } },
        { fromName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.incomingEmail.findMany({
      where,
      include: {
        _count: { select: { attachments: true } },
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const email = await this.prisma.incomingEmail.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        attachments: {
          select: { id: true, fileName: true, fileSize: true, mimeType: true, s3Key: true, createdAt: true },
        },
      },
    });
    if (!email) throw new NotFoundException('Incoming email not found');
    return email;
  }

  async updateStatus(id: string, dto: UpdateIncomingEmailDto) {
    const existing = await this.prisma.incomingEmail.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incoming email not found');
    return this.prisma.incomingEmail.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
