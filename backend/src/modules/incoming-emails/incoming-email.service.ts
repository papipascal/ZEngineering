import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { IncomingEmailFilterDto } from './dto/incoming-email-filter.dto.js';
import { UpdateIncomingEmailDto } from './dto/update-incoming-email.dto.js';
import { CreateRoutingRuleDto, UpdateRoutingRuleDto } from './dto/create-routing-rule.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncomingEmailService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(filter: IncomingEmailFilterDto) {
    const where: Prisma.IncomingEmailWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.status) where.status = filter.status;
    if (filter.purpose) where.purpose = filter.purpose;
    if (filter.isExternal !== undefined) where.isExternal = filter.isExternal === 'true';
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
        assignedTo: { select: { id: true, name: true, email: true, discipline: true } },
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
        assignedTo: { select: { id: true, name: true, email: true, discipline: true } },
      },
    });
    if (!email) throw new NotFoundException('Incoming email not found');
    return email;
  }

  async update(id: string, dto: UpdateIncomingEmailDto) {
    const existing = await this.prisma.incomingEmail.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incoming email not found');
    return this.prisma.incomingEmail.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.purpose !== undefined && { purpose: dto.purpose }),
        ...(dto.documentIntent !== undefined && { documentIntent: dto.documentIntent }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  // ==========================================
  // Routing Rules CRUD
  // ==========================================

  async listRules(projectId: string) {
    return this.prisma.emailRoutingRule.findMany({
      where: { projectId },
      include: {
        targetUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: { priority: 'desc' },
    });
  }

  async createRule(dto: CreateRoutingRuleDto) {
    return this.prisma.emailRoutingRule.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        priority: dto.priority ?? 0,
        senderDomain: dto.senderDomain,
        senderEmail: dto.senderEmail,
        subjectContains: dto.subjectContains,
        isExternal: dto.isExternal,
        target: dto.target,
        targetUserId: dto.targetUserId,
        targetDiscipline: dto.targetDiscipline,
        autoPurpose: dto.autoPurpose,
        autoIntent: dto.autoIntent,
      },
      include: {
        targetUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateRule(id: string, dto: UpdateRoutingRuleDto) {
    const existing = await this.prisma.emailRoutingRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Routing rule not found');

    const data: Prisma.EmailRoutingRuleUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.senderDomain !== undefined) data.senderDomain = dto.senderDomain;
    if (dto.senderEmail !== undefined) data.senderEmail = dto.senderEmail;
    if (dto.subjectContains !== undefined) data.subjectContains = dto.subjectContains;
    if (dto.isExternal !== undefined) data.isExternal = dto.isExternal;
    if (dto.target !== undefined) data.target = dto.target;
    if (dto.targetUserId !== undefined) data.targetUser = dto.targetUserId ? { connect: { id: dto.targetUserId } } : { disconnect: true };
    if (dto.targetDiscipline !== undefined) data.targetDiscipline = dto.targetDiscipline;
    if (dto.autoPurpose !== undefined) data.autoPurpose = dto.autoPurpose;
    if (dto.autoIntent !== undefined) data.autoIntent = dto.autoIntent;
    if (dto.active !== undefined) data.active = dto.active;

    return this.prisma.emailRoutingRule.update({
      where: { id },
      data,
      include: {
        targetUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteRule(id: string) {
    const existing = await this.prisma.emailRoutingRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Routing rule not found');
    return this.prisma.emailRoutingRule.delete({ where: { id } });
  }

  // ==========================================
  // Reply to incoming email
  // ==========================================

  async replyToEmail(emailId: string, params: {
    senderId: string;
    body: string;
  }) {
    const email = await this.prisma.incomingEmail.findUnique({
      where: { id: emailId },
      include: { project: { select: { name: true, projectEmail: true } } },
    });
    if (!email) throw new NotFoundException('Incoming email not found');

    const sender = await this.prisma.user.findUnique({
      where: { id: params.senderId },
      select: { name: true, email: true },
    });
    if (!sender) throw new NotFoundException('Sender user not found');

    const fromAddress = email.project.projectEmail ?? sender.email;

    await this.mailService.sendReply({
      from: fromAddress,
      to: email.fromAddress,
      subject: `Re: ${email.subject}`,
      senderName: sender.name,
      projectName: email.project.name,
      originalSubject: email.subject,
      originalFrom: email.fromName ?? email.fromAddress,
      originalDate: email.receivedAt,
      body: params.body,
    });

    // Mark email as read after reply
    await this.prisma.incomingEmail.update({
      where: { id: emailId },
      data: { status: 'READ' },
    });

    return { success: true, sentTo: email.fromAddress };
  }
}
