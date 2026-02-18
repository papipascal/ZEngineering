import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, ContractItemType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateContractItemDto } from './dto/create-contract-item.dto.js';
import { UpdateContractItemDto } from './dto/update-contract-item.dto.js';
import { FilterContractItemsDto } from './dto/filter-contract-items.dto.js';
import * as XLSX from 'xlsx';

const ITEM_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true, discipline: true } },
  project: { select: { id: true, name: true } },
  document: { select: { id: true, fileName: true, s3Key: true } },
};

@Injectable()
export class ContractItemsService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextItemNumber(projectId: string, type: ContractItemType): Promise<string> {
    const prefix = type === 'REQUIREMENT' ? 'CR' : 'CCL';
    const count = await this.prisma.contractItem.count({ where: { projectId, type } });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async findAll(filter: FilterContractItemsDto) {
    const where: Prisma.ContractItemWhereInput = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.discipline) where.discipline = filter.discipline;
    if (filter.assigneeId) where.assigneeId = filter.assigneeId;
    if (filter.reqCategory) where.reqCategory = { contains: filter.reqCategory, mode: 'insensitive' };
    if (filter.search) {
      where.OR = [
        { itemNumber: { contains: filter.search, mode: 'insensitive' } },
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { clauseRef: { contains: filter.search, mode: 'insensitive' } },
        { docRef: { contains: filter.search, mode: 'insensitive' } },
        { notes: { contains: filter.search, mode: 'insensitive' } },
        { clientRef: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.contractItem.findMany({
      where,
      orderBy: { itemNumber: 'asc' },
      include: ITEM_INCLUDE,
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.contractItem.findUnique({
      where: { id },
      include: ITEM_INCLUDE,
    });
    if (!item) throw new NotFoundException(`Contract item ${id} not found`);
    return item;
  }

  async create(dto: CreateContractItemDto) {
    const itemNumber = await this.nextItemNumber(dto.projectId, dto.type);
    return this.prisma.contractItem.create({
      data: {
        projectId: dto.projectId,
        type: dto.type,
        itemNumber,
        title: dto.title,
        description: dto.description,
        clauseRef: dto.clauseRef,
        specTitle: dto.specTitle,
        docRef: dto.docRef,
        docRevision: dto.docRevision,
        docPage: dto.docPage,
        status: dto.status ?? 'OPEN',
        priority: dto.priority ?? 'MEDIUM',
        discipline: dto.discipline,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        tags: dto.tags,
        reqCategory: dto.reqCategory,
        reqAction: dto.reqAction,
        consequence: dto.consequence,
        scopeLimit: dto.scopeLimit,
        changeRequestedBy: dto.changeRequestedBy,
        changeDate: dto.changeDate ? new Date(dto.changeDate) : undefined,
        commercialImpact: dto.commercialImpact ?? 'NONE',
        commercialValue: dto.commercialValue,
        scheduleImpact: dto.scheduleImpact ?? 'NONE',
        scheduleDays: dto.scheduleDays,
        technicalImpact: dto.technicalImpact,
        clientRef: dto.clientRef,
        deviationType: dto.deviationType,
        documentId: dto.documentId,
      },
      include: ITEM_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateContractItemDto) {
    await this.findOne(id);
    const data: Prisma.ContractItemUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.clauseRef !== undefined) data.clauseRef = dto.clauseRef;
    if (dto.specTitle !== undefined) data.specTitle = dto.specTitle;
    if (dto.docRef !== undefined) data.docRef = dto.docRef;
    if (dto.docRevision !== undefined) data.docRevision = dto.docRevision;
    if (dto.docPage !== undefined) data.docPage = dto.docPage;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.discipline !== undefined) data.discipline = dto.discipline;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.assigneeId !== undefined) {
      data.assignee = dto.assigneeId ? { connect: { id: dto.assigneeId } } : { disconnect: true };
    }
    if (dto.documentId !== undefined) {
      data.document = dto.documentId ? { connect: { id: dto.documentId } } : { disconnect: true };
    }
    // REQUIREMENT fields
    if (dto.reqCategory !== undefined) data.reqCategory = dto.reqCategory;
    if (dto.reqAction !== undefined) data.reqAction = dto.reqAction;
    if (dto.consequence !== undefined) data.consequence = dto.consequence;
    if (dto.scopeLimit !== undefined) data.scopeLimit = dto.scopeLimit;
    // CHANGE fields
    if (dto.changeRequestedBy !== undefined) data.changeRequestedBy = dto.changeRequestedBy;
    if (dto.changeDate !== undefined) data.changeDate = dto.changeDate ? new Date(dto.changeDate) : null;
    if (dto.commercialImpact !== undefined) data.commercialImpact = dto.commercialImpact;
    if (dto.commercialValue !== undefined) data.commercialValue = dto.commercialValue;
    if (dto.scheduleImpact !== undefined) data.scheduleImpact = dto.scheduleImpact;
    if (dto.scheduleDays !== undefined) data.scheduleDays = dto.scheduleDays;
    if (dto.technicalImpact !== undefined) data.technicalImpact = dto.technicalImpact;
    if (dto.clientRef !== undefined) data.clientRef = dto.clientRef;
    if (dto.deviationType !== undefined) data.deviationType = dto.deviationType;

    return this.prisma.contractItem.update({ where: { id }, data, include: ITEM_INCLUDE });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contractItem.delete({ where: { id } });
  }

  // ── Excel Import ──

  async importFromExcel(file: Express.Multer.File, projectId: string, type: ContractItemType) {
    if (!file) throw new BadRequestException('No file provided');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new BadRequestException('Excel file has no sheets');
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: '' });
    if (rows.length === 0) throw new BadRequestException('Excel file contains no data rows');

    const created: unknown[] = [];
    for (const row of rows) {
      const title = this.str(row['title'] ?? row['Title'] ?? row['Domaine'] ?? row['domaine'] ?? '');
      if (!title) continue;

      const dto: CreateContractItemDto = {
        projectId,
        type,
        title,
        description: this.str(row['description'] ?? row['Description'] ?? row['Réponse trouvée (si synthétique)'] ?? row['Texte'] ?? ''),
        clauseRef: this.str(row['clauseRef'] ?? row['Clause Ref'] ?? row['Chapitre'] ?? row['chap'] ?? ''),
        specTitle: this.str(row['specTitle'] ?? row['Titre spec'] ?? row['spec titre'] ?? ''),
        docRef: this.str(row['docRef'] ?? row['Nom du fichier / référence du document'] ?? row['ref'] ?? ''),
        docRevision: this.str(row['docRevision'] ?? row['Revision'] ?? row['rev'] ?? ''),
        docPage: this.str(row['docPage'] ?? row['Page'] ?? ''),
        priority: this.parseEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], row['priority'] ?? row['Priority'] ?? row['priorité']) as any,
        discipline: this.parseDiscipline(row['discipline'] ?? row['Discipline']),
        notes: this.str(row['notes'] ?? row['Notes'] ?? row['NOTES'] ?? row['note'] ?? ''),
        // REQUIREMENT
        reqCategory: this.str(row['reqCategory'] ?? row['Category'] ?? row['category'] ?? row['Domaine'] ?? ''),
        reqAction: this.str(row['reqAction'] ?? row['Action'] ?? row['action'] ?? ''),
        consequence: this.str(row['consequence'] ?? row['Consequence'] ?? row['conséquence'] ?? ''),
        scopeLimit: this.str(row['scopeLimit'] ?? row['Limites'] ?? row['limites'] ?? ''),
        // CHANGE
        changeRequestedBy: this.str(row['changeRequestedBy'] ?? row['Requested By'] ?? ''),
        clientRef: this.str(row['clientRef'] ?? row['Client Ref'] ?? ''),
        technicalImpact: this.str(row['technicalImpact'] ?? row['Technical Impact'] ?? ''),
        deviationType: this.str(row['deviationType'] ?? row['Deviation Clarification'] ?? row['Déviation à faire'] ?? ''),
        commercialImpact: this.parseEnum(['NONE', 'MINOR', 'MODERATE', 'MAJOR'], row['commercialImpact'] ?? row['Commercial Impact']) as any,
        scheduleImpact: this.parseEnum(['NONE', 'MINOR', 'MODERATE', 'MAJOR'], row['scheduleImpact'] ?? row['Schedule Impact']) as any,
        commercialValue: this.parseFloat(row['commercialValue'] ?? row['Commercial Value']),
        scheduleDays: this.parseInt(row['scheduleDays'] ?? row['Schedule Days']),
      };

      const item = await this.create(dto);
      created.push(item);
    }
    return { imported: created.length, items: created };
  }

  private str(val: unknown): string | undefined {
    const s = String(val ?? '').trim();
    return s || undefined;
  }

  private parseEnum(allowed: string[], val: unknown): string | undefined {
    if (!val) return undefined;
    const upper = String(val).toUpperCase().trim().replace(/ /g, '_');
    return allowed.includes(upper) ? upper : undefined;
  }

  private parseDiscipline(val: unknown): any {
    if (!val) return undefined;
    const map: Record<string, string> = {
      PROCESS: 'PROCESS', PIPING: 'PIPING', ELECTRICAL: 'ELECTRICAL',
      INSTRUMENTATION: 'INSTRUMENTATION', CIVIL: 'CIVIL', MECHANICAL: 'MECHANICAL',
      PROJET: 'PROCESS', // French mapping
    };
    const upper = String(val).toUpperCase().trim();
    return map[upper] ?? undefined;
  }

  private parseFloat(val: unknown): number | undefined {
    const n = parseFloat(String(val ?? ''));
    return isNaN(n) ? undefined : n;
  }

  private parseInt(val: unknown): number | undefined {
    const n = parseInt(String(val ?? ''), 10);
    return isNaN(n) ? undefined : n;
  }
}
