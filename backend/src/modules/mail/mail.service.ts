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

  async sendTransmittal(params: {
    from: string;
    to: string;
    subject: string;
    transmittalNumber: string;
    purpose: string;
    coverLetter?: string;
    senderName: string;
    projectName: string;
    documents: Array<{ name: string; revision?: string; downloadUrl: string }>;
  }): Promise<void> {
    const { from, to, subject, transmittalNumber, purpose, coverLetter, senderName, projectName, documents } = params;

    const purposeBadge: Record<string, string> = {
      FOR_REVIEW: '#1976d2',
      FOR_APPROVAL: '#ed6c02',
      FOR_INFORMATION: '#2e7d32',
      FOR_CONSTRUCTION: '#9c27b0',
      AS_BUILT: '#616161',
    };
    const badgeColor = purposeBadge[purpose] || '#1976d2';
    const purposeLabel = purpose.replace(/_/g, ' ');

    const docRows = documents.map((doc) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${doc.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${doc.revision || '-'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          ${doc.downloadUrl ? `<a href="${doc.downloadUrl}" style="color:#1976d2;">Download</a>` : 'N/A'}
        </td>
      </tr>
    `).join('');

    await this.transporter.sendMail({
      from,
      to,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;">
          <div style="background:#1976d2;color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;font-size:20px;">Transmittal ${transmittalNumber}</h1>
            <span style="display:inline-block;background:${badgeColor};color:white;padding:4px 12px;border-radius:4px;margin-top:8px;font-size:13px;">${purposeLabel}</span>
          </div>
          <div style="padding:20px;border:1px solid #e0e0e0;border-top:none;">
            <p><strong>Project:</strong> ${projectName}</p>
            <p><strong>From:</strong> ${senderName}</p>
            ${coverLetter ? `<div style="background:#f5f5f5;padding:16px;border-radius:4px;margin:16px 0;"><p style="margin:0;">${coverLetter.replace(/\n/g, '<br>')}</p></div>` : ''}
            <h3 style="margin-top:20px;">Documents</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px;text-align:left;border-bottom:2px solid #e0e0e0;">Document</th>
                  <th style="padding:8px;text-align:left;border-bottom:2px solid #e0e0e0;">Rev</th>
                  <th style="padding:8px;text-align:left;border-bottom:2px solid #e0e0e0;">Link</th>
                </tr>
              </thead>
              <tbody>${docRows}</tbody>
            </table>
            <p style="color:#888;font-size:12px;margin-top:20px;">Download links expire in 24 hours. Please save documents promptly.</p>
          </div>
          <div style="text-align:center;padding:12px;color:#888;font-size:11px;">
            Sent via Zen-gineering
          </div>
        </div>
      `,
    });
    this.logger.log(`Sent transmittal ${transmittalNumber} to ${to}`);
  }
}
