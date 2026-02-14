import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private readonly config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'noreply@zengineering.local');
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: config.get<number>('SMTP_PORT', 1025),
      secure: false,
    });
  }

  async sendDocumentShare(params: {
    to: string;
    senderName: string;
    documentName: string;
    downloadUrl: string;
    message?: string;
  }): Promise<void> {
    const { to, senderName, documentName, downloadUrl, message } = params;
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `${senderName} shared a document with you: ${documentName}`,
      html: `
        <h2>Document shared via Zen-gineering</h2>
        <p><strong>${senderName}</strong> shared the document <strong>${documentName}</strong> with you.</p>
        ${message ? `<p>Message: ${message}</p>` : ''}
        <p><a href="${downloadUrl}">Download Document</a></p>
        <p style="color:#888;">This link expires in 24 hours.</p>
      `,
    });
    this.logger.log(`Sent document share email to ${to}`);
  }
}
