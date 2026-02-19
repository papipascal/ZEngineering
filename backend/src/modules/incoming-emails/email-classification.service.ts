import { Injectable } from '@nestjs/common';
import { Discipline } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DISCIPLINE_KEYWORDS } from './email-router.service.js';

@Injectable()
export class EmailClassificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the first discipline matched by keyword scan of the text.
   */
  classifyDiscipline(text: string): Discipline | null {
    const lower = text.toLowerCase();
    for (const [keyword, discipline] of Object.entries(DISCIPLINE_KEYWORDS)) {
      if (lower.includes(keyword.toLowerCase())) {
        return discipline;
      }
    }
    return null;
  }

  /**
   * Attempts to extract a document number from text using the project's regex pattern.
   * Falls back to null if no pattern or no match.
   */
  extractDocNumber(text: string, pattern: string | null): string | null {
    if (!pattern) return null;
    try {
      const regex = new RegExp(pattern, 'i');
      const match = regex.exec(text);
      return match?.[0] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Finds a ProjectTree node whose name contains the discipline keyword.
   * Returns the node id, or null if not found.
   */
  async suggestTreeNode(projectId: string, discipline: Discipline | null): Promise<string | null> {
    if (!discipline) return null;
    const node = await this.prisma.projectTree.findFirst({
      where: {
        projectId,
        name: { contains: discipline, mode: 'insensitive' },
      },
      select: { id: true },
    });
    return node?.id ?? null;
  }
}
