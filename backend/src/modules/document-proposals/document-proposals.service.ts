import { Injectable, NotFoundException } from '@nestjs/common';
import { Discipline } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ReviewProposalDto } from './document-proposal.dto.js';

const PROPOSAL_INCLUDE = {
  incomingEmail: {
    select: { id: true, subject: true, fromAddress: true, fromName: true, receivedAt: true },
  },
  document: {
    select: { id: true, fileName: true, fileSize: true, mimeType: true, s3Key: true },
  },
  reviewedBy: {
    select: { id: true, name: true },
  },
} as const;

@Injectable()
export class DocumentProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByProject(projectId: string, status?: string) {
    return this.prisma.documentProposal.findMany({
      where: {
        projectId,
        ...(status ? { status } : {}),
      },
      include: PROPOSAL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(id: string, userId: string, dto: ReviewProposalDto) {
    const proposal = await this.prisma.documentProposal.findUnique({
      where: { id },
      include: { document: true },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');

    const docNumber = dto.proposedDocNumber ?? proposal.proposedDocNumber;
    const title = dto.proposedTitle ?? proposal.proposedTitle ?? proposal.document.fileName;
    const discipline = (dto.proposedDiscipline ?? proposal.proposedDiscipline) as Discipline | null;

    // Create or update the DocumentRegisterEntry
    if (docNumber && discipline) {
      const existing = await this.prisma.documentRegisterEntry.findUnique({
        where: { projectId_documentNumber: { projectId: proposal.projectId, documentNumber: docNumber } },
      });

      if (existing) {
        // Link the document as a new revision
        await this.prisma.document.update({
          where: { id: proposal.documentId },
          data: { registerEntryId: existing.id },
        });
      } else {
        // Create new register entry
        const entry = await this.prisma.documentRegisterEntry.create({
          data: {
            projectId: proposal.projectId,
            documentNumber: docNumber,
            title,
            discipline,
            ownerId: userId,
            status: 'DRAFT',
          },
        });
        await this.prisma.document.update({
          where: { id: proposal.documentId },
          data: { registerEntryId: entry.id },
        });
      }
    }

    return this.prisma.documentProposal.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        reviewedById: userId,
        reviewedAt: new Date(),
        notes: dto.notes,
        ...(dto.proposedDocNumber && { proposedDocNumber: dto.proposedDocNumber }),
        ...(dto.proposedTitle && { proposedTitle: dto.proposedTitle }),
        ...(dto.proposedDiscipline && { proposedDiscipline: dto.proposedDiscipline }),
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async reject(id: string, userId: string, dto: ReviewProposalDto) {
    const proposal = await this.prisma.documentProposal.findUnique({ where: { id } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    return this.prisma.documentProposal.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: userId,
        reviewedAt: new Date(),
        notes: dto.notes,
      },
      include: PROPOSAL_INCLUDE,
    });
  }
}
