import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateEmailRuleDto } from './dto/create-email-rule.dto.js';
import { UpdateEmailRuleDto } from './dto/update-email-rule.dto.js';

@Injectable()
export class EmailRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string) {
    return this.prisma.emailRoutingRule.findMany({
      where: { projectId },
      orderBy: { priority: 'desc' },
      include: {
        targetUser: { select: { id: true, name: true, email: true, discipline: true } },
      },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.emailRoutingRule.findUnique({
      where: { id },
      include: {
        targetUser: { select: { id: true, name: true, email: true, discipline: true } },
      },
    });
    if (!rule) throw new NotFoundException(`Email rule ${id} not found`);
    return rule;
  }

  async create(dto: CreateEmailRuleDto) {
    const { projectId, targetUserId, targetDiscipline, autoPurpose, autoIntent, ...rest } = dto;
    return this.prisma.emailRoutingRule.create({
      data: {
        ...rest,
        project: { connect: { id: projectId } },
        ...(targetUserId && { targetUser: { connect: { id: targetUserId } } }),
        targetDiscipline: targetDiscipline ?? null,
        autoPurpose: autoPurpose ?? null,
        autoIntent: autoIntent ?? null,
      },
      include: {
        targetUser: { select: { id: true, name: true, email: true, discipline: true } },
      },
    });
  }

  async update(id: string, dto: UpdateEmailRuleDto) {
    await this.findOne(id);
    const { projectId, targetUserId, targetDiscipline, autoPurpose, autoIntent, ...rest } = dto;
    return this.prisma.emailRoutingRule.update({
      where: { id },
      data: {
        ...rest,
        ...(targetUserId !== undefined && {
          targetUser: targetUserId ? { connect: { id: targetUserId } } : { disconnect: true },
        }),
        ...(targetDiscipline !== undefined && { targetDiscipline: targetDiscipline ?? null }),
        ...(autoPurpose !== undefined && { autoPurpose: autoPurpose ?? null }),
        ...(autoIntent !== undefined && { autoIntent: autoIntent ?? null }),
      },
      include: {
        targetUser: { select: { id: true, name: true, email: true, discipline: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.emailRoutingRule.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const rule = await this.findOne(id);
    return this.prisma.emailRoutingRule.update({
      where: { id },
      data: { active: !rule.active },
    });
  }
}
