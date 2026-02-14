import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDiscussionDto } from './dto/create-discussion.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { DiscussionFilterDto } from './dto/discussion-filter.dto.js';

@Injectable()
export class DiscussionService {
  constructor(private readonly prisma: PrismaService) {}

  async createDiscussion(dto: CreateDiscussionDto) {
    return this.prisma.discussion.create({
      data: dto,
      include: {
        author: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, tagNumber: true, service: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async listDiscussions(filter: DiscussionFilterDto) {
    const where: Prisma.DiscussionWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.equipmentId) where.equipmentId = filter.equipmentId;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.discussion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
        equipment: { select: { id: true, tagNumber: true, service: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });
  }

  async getDiscussion(id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, tagNumber: true, service: true } },
        project: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true } },
            documents: {
              select: { id: true, fileName: true, fileSize: true, mimeType: true, createdAt: true },
            },
          },
        },
        documents: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, fileName: true, fileSize: true, mimeType: true, createdAt: true, uploadedBy: { select: { id: true, name: true } } },
        },
      },
    });
    if (!discussion) throw new NotFoundException(`Discussion ${id} not found`);
    return discussion;
  }

  async addComment(discussionId: string, dto: CreateCommentDto) {
    await this.getDiscussion(discussionId);
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId: dto.authorId,
        discussionId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  async deleteDiscussion(id: string) {
    await this.getDiscussion(id);
    return this.prisma.discussion.delete({ where: { id } });
  }

  async deleteComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException(`Comment ${commentId} not found`);
    return this.prisma.comment.delete({ where: { id: commentId } });
  }

  async searchAll(query: string) {
    const [discussions, equipment, vendors] = await Promise.all([
      this.prisma.discussion.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          equipment: { select: { id: true, tagNumber: true, service: true } },
          project: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.equipment.findMany({
        where: {
          OR: [
            { tagNumber: { contains: query, mode: 'insensitive' } },
            { service: { contains: query, mode: 'insensitive' } },
            { subType: { contains: query, mode: 'insensitive' } },
            { material: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { tagNumber: 'asc' },
        include: { project: { select: { id: true, name: true } } },
      }),
      this.prisma.vendor.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { country: { contains: query, mode: 'insensitive' } },
            { specialties: { some: { equipmentType: { contains: query, mode: 'insensitive' } } } },
          ],
        },
        include: { specialties: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { discussions, equipment, vendors };
  }
}
