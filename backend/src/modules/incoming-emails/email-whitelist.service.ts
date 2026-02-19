import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class EmailWhitelistService {
  constructor(private readonly prisma: PrismaService) {}

  async listWhitelist(projectId: string) {
    return this.prisma.emailSenderWhitelist.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: { addedBy: { select: { id: true, name: true } } },
    });
  }

  async addToWhitelist(data: {
    projectId: string;
    emailOrDomain: string;
    label?: string;
    addedByUserId: string;
  }) {
    return this.prisma.emailSenderWhitelist.upsert({
      where: { projectId_emailOrDomain: { projectId: data.projectId, emailOrDomain: data.emailOrDomain } },
      update: { label: data.label },
      create: {
        projectId: data.projectId,
        emailOrDomain: data.emailOrDomain,
        label: data.label,
        addedByUserId: data.addedByUserId,
      },
    });
  }

  async removeFromWhitelist(id: string) {
    return this.prisma.emailSenderWhitelist.delete({ where: { id } });
  }

  /**
   * Returns true if the sender is authorized.
   * If the project has no whitelist entries, all senders are allowed (opt-in model).
   */
  async isAuthorizedSender(projectId: string, fromAddress: string): Promise<boolean> {
    const count = await this.prisma.emailSenderWhitelist.count({ where: { projectId } });
    if (count === 0) return true; // no whitelist = all allowed

    const lowerFrom = fromAddress.toLowerCase();
    const domain = lowerFrom.split('@')[1] ?? '';

    const match = await this.prisma.emailSenderWhitelist.findFirst({
      where: {
        projectId,
        OR: [
          { emailOrDomain: { equals: lowerFrom, mode: 'insensitive' } },
          { emailOrDomain: { equals: domain, mode: 'insensitive' } },
        ],
      },
    });
    return match !== null;
  }
}
