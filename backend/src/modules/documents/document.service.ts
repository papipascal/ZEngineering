import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { MailService } from '../mail/mail.service.js';
import { UploadDocumentDto } from './dto/upload-document.dto.js';
import { DocumentFilterDto } from './dto/document-filter.dto.js';
import { ShareDocumentDto } from './dto/share-document.dto.js';
import { randomUUID } from 'crypto';

const DOC_INCLUDE = {
  uploadedBy: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  equipment: { select: { id: true, tagNumber: true, service: true } },
  vendor: { select: { id: true, name: true } },
};

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly mail: MailService,
  ) {}

  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    uploadedById: string,
  ) {
    const s3Key = `projects/${dto.projectId}/${randomUUID()}-${file.originalname}`;

    await this.storage.upload(s3Key, file.buffer, file.mimetype);

    return this.prisma.document.create({
      data: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        s3Key,
        category: dto.category ?? 'OTHER',
        description: dto.description,
        uploadedById,
        projectId: dto.projectId,
        equipmentId: dto.equipmentId,
        vendorId: dto.vendorId,
        discussionId: dto.discussionId,
        commentId: dto.commentId,
        registerEntryId: dto.registerEntryId,
      },
      include: DOC_INCLUDE,
    });
  }

  async findAll(filter: DocumentFilterDto) {
    const where: Prisma.DocumentWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.equipmentId) where.equipmentId = filter.equipmentId;
    if (filter.vendorId) where.vendorId = filter.vendorId;
    if (filter.discussionId) where.discussionId = filter.discussionId;
    if (filter.category) where.category = filter.category;
    if (filter.search) {
      where.OR = [
        { fileName: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: DOC_INCLUDE,
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        ...DOC_INCLUDE,
        discussion: { select: { id: true, title: true } },
      },
    });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async download(id: string) {
    const doc = await this.findOne(id);
    const { stream, contentType } = await this.storage.getStream(doc.s3Key);
    return { stream, contentType: contentType ?? doc.mimeType, fileName: doc.fileName };
  }

  async getPresignedUrl(id: string) {
    const doc = await this.findOne(id);
    const url = await this.storage.getPresignedUrl(doc.s3Key, 3600);
    return { url, fileName: doc.fileName };
  }

  async share(id: string, dto: ShareDocumentDto, senderId: string) {
    const doc = await this.findOne(id);
    const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) throw new NotFoundException('Sender not found');

    const downloadUrl = await this.storage.getPresignedUrl(doc.s3Key, 86400);

    await this.mail.sendDocumentShare({
      to: dto.recipientEmail,
      senderName: sender.name,
      documentName: doc.fileName,
      downloadUrl,
      message: dto.message,
    });

    return { message: `Document shared with ${dto.recipientEmail}` };
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    await this.storage.delete(doc.s3Key);
    return this.prisma.document.delete({ where: { id } });
  }
}
