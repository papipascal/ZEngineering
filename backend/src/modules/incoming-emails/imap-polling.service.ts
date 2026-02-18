import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { EmailRouterService } from './email-router.service.js';
import { ImapFlow } from 'imapflow';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ImapPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ImapPollingService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private polling = false;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private emailRouter: EmailRouterService,
  ) {}

  onModuleInit() {
    if (!process.env.IMAP_HOST) {
      this.logger.log('IMAP_HOST not set — IMAP polling disabled');
      return;
    }
    const interval = parseInt(process.env.IMAP_POLL_INTERVAL || '60', 10) * 1000;
    this.logger.log(`IMAP polling enabled (every ${interval / 1000}s) for ${process.env.IMAP_HOST}`);
    // Initial poll after 5s, then on interval
    setTimeout(() => this.poll(), 5000);
    this.timer = setInterval(() => this.poll(), interval);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async poll() {
    if (this.polling) return;
    this.polling = true;
    try {
      await this.fetchEmails();
    } catch (err) {
      this.logger.error('IMAP poll error', err instanceof Error ? err.message : err);
    } finally {
      this.polling = false;
    }
  }

  private async fetchEmails() {
    const client = new ImapFlow({
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      secure: process.env.IMAP_TLS !== 'false',
      auth: {
        user: process.env.IMAP_USER || '',
        pass: process.env.IMAP_PASSWORD || '',
      },
      logger: false,
    });

    await client.connect();

    try {
      const lock = await client.getMailboxLock('INBOX');
      try {
        const messages = client.fetch({ seen: false }, {
          envelope: true,
          source: true,
          bodyStructure: true,
        });

        for await (const msg of messages) {
          try {
            await this.processMessage(client, msg);
          } catch (err) {
            this.logger.error(`Failed to process message ${msg.uid}`, err instanceof Error ? err.message : err);
          }
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  private async processMessage(client: ImapFlow, msg: any) {
    const envelope = msg.envelope;
    const messageId = envelope.messageId;
    if (!messageId) return;

    // Dedup check
    const existing = await this.prisma.incomingEmail.findUnique({ where: { messageId } });
    if (existing) return;

    // Match to address to a project
    const toAddress = envelope.to?.[0]?.address?.toLowerCase();
    if (!toAddress) return;

    const project = await this.prisma.project.findFirst({
      where: { projectEmail: { equals: toAddress, mode: 'insensitive' } },
    });
    if (!project) {
      this.logger.debug(`No project matched for ${toAddress}`);
      return;
    }

    const fromAddress = envelope.from?.[0]?.address || '';
    const fromName = envelope.from?.[0]?.name || null;
    const subject = envelope.subject || '(no subject)';
    const receivedAt = envelope.date || new Date();

    // Parse body text from source
    let bodyText: string | null = null;
    if (msg.source) {
      const sourceStr = msg.source.toString();
      // Simple extraction: take content after double newline
      const bodyStart = sourceStr.indexOf('\r\n\r\n');
      if (bodyStart > -1) {
        bodyText = sourceStr.substring(bodyStart + 4).substring(0, 10000); // Limit to 10k chars
      }
    }

    // Process attachments
    const attachmentDocs: Array<{ fileName: string; fileSize: number; mimeType: string; s3Key: string }> = [];
    if (msg.bodyStructure?.childNodes) {
      for (const part of msg.bodyStructure.childNodes) {
        if (part.disposition === 'attachment' && part.part) {
          try {
            const { content } = await client.download(String(msg.seq), part.part);
            const chunks: Buffer[] = [];
            for await (const chunk of content) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const buffer = Buffer.concat(chunks);
            const fileName = part.dispositionParameters?.filename || part.parameters?.name || `attachment-${uuid()}`;
            const s3Key = `projects/${project.id}/inbox/${uuid()}-${fileName}`;
            await this.storageService.upload(s3Key, buffer, part.type || 'application/octet-stream');
            attachmentDocs.push({
              fileName,
              fileSize: buffer.length,
              mimeType: part.type || 'application/octet-stream',
              s3Key,
            });
          } catch (err) {
            this.logger.error(`Failed to download attachment ${part.part}`, err instanceof Error ? err.message : err);
          }
        }
      }
    }

    // Auto-detect if sender is external (not a registered user)
    const knownUser = await this.prisma.user.findFirst({
      where: { email: { equals: fromAddress, mode: 'insensitive' } },
    });
    const isExternal = !knownUser;

    // Create IncomingEmail + Document records in a transaction
    const createdEmail = await this.prisma.$transaction(async (tx) => {
      const incomingEmail = await tx.incomingEmail.create({
        data: {
          projectId: project.id,
          messageId,
          fromAddress,
          fromName,
          toAddress,
          subject,
          bodyText,
          receivedAt,
          isExternal,
        },
      });

      for (const att of attachmentDocs) {
        await tx.document.create({
          data: {
            ...att,
            category: 'OTHER',
            folder: 'EMAILS',
            projectId: project.id,
            uploadedById: (await tx.projectMember.findFirst({
              where: { projectId: project.id, role: 'owner' },
              select: { userId: true },
            }))?.userId || (await tx.user.findFirst({ select: { id: true } }))!.id,
            incomingEmailId: incomingEmail.id,
          },
        });
      }

      return incomingEmail;
    });

    // Route the email to the appropriate person/workflow
    try {
      await this.emailRouter.routeEmail(createdEmail.id, project.id);
    } catch (err) {
      this.logger.error(`Email routing failed for "${subject}"`, err instanceof Error ? err.message : err);
    }

    // Mark as seen in IMAP
    await client.messageFlagsAdd(String(msg.seq), ['\\Seen']);
    this.logger.log(`Processed email "${subject}" from ${fromAddress} for project ${project.name}`);
  }
}
