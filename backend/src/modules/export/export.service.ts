import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportEquipmentList(projectId: string): Promise<string> {
    const items = await this.prisma.equipment.findMany({
      where: { projectId },
      orderBy: { tagNumber: 'asc' },
    });
    if (items.length === 0) throw new NotFoundException('No equipment found');

    const headers = [
      'Tag Number', 'Service', 'Category', 'Sub Type', 'Qty',
      'Material', 'Op. Pressure (barg)', 'Op. Temperature (C)',
      'Design Pressure (barg)', 'Design Temperature (C)',
      'Est. Weight (kg)', 'Size', 'Notes',
    ];

    const rows = items.map((e) => [
      e.tagNumber, e.service, e.category, e.subType ?? '', e.quantity,
      e.material ?? '', e.operatingPressure ?? '', e.operatingTemperature ?? '',
      e.designPressure ?? '', e.designTemperature ?? '',
      e.estimatedWeight ?? '', e.size ?? '', (e.notes ?? '').replace(/"/g, '""'),
    ]);

    return this.toCsv(headers, rows);
  }

  async exportDocumentRegister(projectId: string): Promise<string> {
    const entries = await this.prisma.documentRegisterEntry.findMany({
      where: { projectId },
      include: { owner: { select: { name: true } } },
      orderBy: { documentNumber: 'asc' },
    });
    if (entries.length === 0) throw new NotFoundException('No document register entries found');

    const headers = [
      'Document Number', 'Title', 'Discipline', 'Owner',
      'Revision', 'Status', 'Issue Date', 'Description',
    ];

    const rows = entries.map((e) => [
      e.documentNumber, e.title, e.discipline, e.owner.name,
      e.revision, e.status, e.issueDate?.toISOString().split('T')[0] ?? '',
      (e.description ?? '').replace(/"/g, '""'),
    ]);

    return this.toCsv(headers, rows);
  }

  async exportVendorList(projectId: string): Promise<string> {
    const projectVendors = await this.prisma.projectVendor.findMany({
      where: { projectId },
      include: {
        vendor: {
          include: { specialties: true },
        },
      },
    });

    const allVendors = await this.prisma.vendor.findMany({
      include: { specialties: true },
      orderBy: { name: 'asc' },
    });

    const vendors = projectVendors.length > 0
      ? projectVendors.map((pv) => ({ ...pv.vendor, notes: pv.notes }))
      : allVendors.map((v) => ({ ...v, notes: null as string | null }));

    const headers = ['Name', 'Country', 'Specialties', 'Project Notes'];

    const rows = vendors.map((v) => [
      v.name,
      v.country ?? '',
      v.specialties.map((s) => s.equipmentType).join('; '),
      (v.notes ?? '').replace(/"/g, '""'),
    ]);

    return this.toCsv(headers, rows);
  }

  async exportContractItems(projectId: string): Promise<string> {
    const items = await this.prisma.contractItem.findMany({
      where: { projectId },
      include: { assignee: { select: { name: true } } },
      orderBy: { itemNumber: 'asc' },
    });
    if (items.length === 0) throw new NotFoundException('No contract items found');

    const headers = [
      'Item Number', 'Type', 'Title', 'Description', 'Clause Ref',
      'Status', 'Priority', 'Discipline', 'Assignee',
      'Due Date', 'Commercial Impact', 'Schedule Impact',
    ];

    const rows = items.map((i) => [
      i.itemNumber, i.type, i.title, (i.description ?? '').replace(/"/g, '""'),
      i.clauseRef ?? '', i.status, i.priority, i.discipline ?? '',
      i.assignee?.name ?? '', i.dueDate?.toISOString().split('T')[0] ?? '',
      i.commercialImpact, i.scheduleImpact,
    ]);

    return this.toCsv(headers, rows);
  }

  async exportTransmittals(projectId: string): Promise<string> {
    const transmittals = await this.prisma.transmittal.findMany({
      where: { projectId },
      include: {
        sentBy: { select: { name: true } },
        items: { include: { registerEntry: { select: { documentNumber: true, title: true } } } },
      },
      orderBy: { transmittalNumber: 'asc' },
    });
    if (transmittals.length === 0) throw new NotFoundException('No transmittals found');

    const headers = [
      'Transmittal Number', 'Subject', 'Purpose', 'Recipient',
      'Recipient Email', 'Sent By', 'Status', 'Sent At', 'Documents',
    ];

    const rows = transmittals.map((t) => [
      t.transmittalNumber, t.subject, t.purpose, t.recipientName,
      t.recipientEmail, t.sentBy.name, t.status,
      t.sentAt?.toISOString().split('T')[0] ?? '',
      t.items.map((i) => i.registerEntry?.documentNumber ?? 'attachment').join('; '),
    ]);

    return this.toCsv(headers, rows);
  }

  async exportAuditLog(projectId: string): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const headers = ['Date', 'Action', 'Entity', 'Entity ID', 'Summary', 'User ID'];

    const rows = logs.map((l) => [
      l.createdAt.toISOString(),
      l.action, l.entity, l.entityId ?? '',
      l.summary.replace(/"/g, '""'), l.userId ?? '',
    ]);

    return this.toCsv(headers, rows);
  }

  private toCsv(headers: string[], rows: unknown[][]): string {
    const escape = (val: unknown) => {
      const s = String(val ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const lines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];
    return lines.join('\n');
  }
}
