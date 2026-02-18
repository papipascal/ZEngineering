import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDataOriginDto } from './dto/create-data-origin.dto.js';
import { FilterDataOriginDto } from './dto/filter-data-origin.dto.js';

const ORIGIN_INCLUDE = {
  sourceEntry: { select: { id: true, documentNumber: true, title: true, revision: true, issueDate: true } },
  sourceDocument: { select: { id: true, fileName: true } },
  validatedBy: { select: { id: true, name: true } },
};

const EQUIPMENT_FIELDS = [
  'operatingPressure', 'operatingTemperature',
  'designPressure', 'designTemperature',
  'estimatedWeight', 'material', 'size', 'notes', 'service',
];

@Injectable()
export class DataOriginService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDataOriginDto, userId: string) {
    const data: Prisma.DataOriginCreateInput = {
      equipment: { connect: { id: dto.equipmentId } },
      fieldName: dto.fieldName,
      fieldValue: dto.fieldValue,
      validatedBy: { connect: { id: userId } },
      notes: dto.notes,
      sourcePage: dto.sourcePage,
      sourceRef: dto.sourceRef,
    };

    // If a register entry is provided, auto-fill revision and issue date from it
    if (dto.sourceEntryId) {
      const entry = await this.prisma.documentRegisterEntry.findUnique({
        where: { id: dto.sourceEntryId },
        select: { revision: true, issueDate: true },
      });
      if (!entry) throw new NotFoundException(`DocumentRegisterEntry ${dto.sourceEntryId} not found`);
      data.sourceEntry = { connect: { id: dto.sourceEntryId } };
      data.sourceRevision = dto.sourceRevision ?? entry.revision;
      data.sourceIssueDate = dto.sourceIssueDate ? new Date(dto.sourceIssueDate) : entry.issueDate;
    } else {
      data.sourceRevision = dto.sourceRevision;
      data.sourceIssueDate = dto.sourceIssueDate ? new Date(dto.sourceIssueDate) : undefined;
    }

    if (dto.sourceDocumentId) {
      data.sourceDocument = { connect: { id: dto.sourceDocumentId } };
    }

    return this.prisma.dataOrigin.create({ data, include: ORIGIN_INCLUDE });
  }

  async findByEquipment(equipmentId: string) {
    return this.prisma.dataOrigin.findMany({
      where: { equipmentId },
      orderBy: { validatedAt: 'desc' },
      include: ORIGIN_INCLUDE,
    });
  }

  async findByField(equipmentId: string, fieldName: string) {
    return this.prisma.dataOrigin.findMany({
      where: { equipmentId, fieldName },
      orderBy: { validatedAt: 'desc' },
      include: ORIGIN_INCLUDE,
    });
  }

  async findLatestPerField(equipmentId: string) {
    // Get all origins for this equipment, then pick latest per field
    const all = await this.prisma.dataOrigin.findMany({
      where: { equipmentId },
      orderBy: { validatedAt: 'desc' },
      include: ORIGIN_INCLUDE,
    });

    const latestMap = new Map<string, typeof all[0]>();
    for (const origin of all) {
      if (!latestMap.has(origin.fieldName)) {
        latestMap.set(origin.fieldName, origin);
      }
    }
    return Object.fromEntries(latestMap);
  }

  async findAll(filter: FilterDataOriginDto) {
    const where: Prisma.DataOriginWhereInput = {};
    if (filter.equipmentId) where.equipmentId = filter.equipmentId;
    if (filter.fieldName) where.fieldName = filter.fieldName;
    if (filter.validatedById) where.validatedById = filter.validatedById;

    return this.prisma.dataOrigin.findMany({
      where,
      orderBy: { validatedAt: 'desc' },
      include: ORIGIN_INCLUDE,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const origin = await this.prisma.dataOrigin.findUnique({ where: { id } });
    if (!origin) throw new NotFoundException(`DataOrigin ${id} not found`);
    if (origin.validatedById !== userId && userRole !== 'manager' && userRole !== 'admin') {
      throw new ForbiddenException('Only the validator or a manager can delete this origin');
    }
    return this.prisma.dataOrigin.delete({ where: { id } });
  }

  async checkStaleness(projectId: string) {
    // Get all equipment in the project
    const equipment = await this.prisma.equipment.findMany({
      where: { projectId },
      select: { id: true, tagNumber: true, service: true },
    });

    const equipmentIds = equipment.map((e) => e.id);
    const equipmentMap = new Map(equipment.map((e) => [e.id, e]));

    // Get all latest origins
    const allOrigins = await this.prisma.dataOrigin.findMany({
      where: { equipmentId: { in: equipmentIds } },
      orderBy: { validatedAt: 'desc' },
      include: {
        sourceEntry: { select: { id: true, documentNumber: true, revision: true } },
      },
    });

    // Build latest per (equipment, field)
    const latestOrigins = new Map<string, typeof allOrigins[0]>();
    for (const o of allOrigins) {
      const key = `${o.equipmentId}::${o.fieldName}`;
      if (!latestOrigins.has(key)) latestOrigins.set(key, o);
    }

    const staleItems: {
      equipmentId: string; tagNumber: string; fieldName: string;
      currentRevision: string; latestRevision: string; documentNumber: string;
    }[] = [];

    const unvalidatedFields: {
      equipmentId: string; tagNumber: string; fieldName: string;
    }[] = [];

    let upToDateCount = 0;
    const totalFields = equipment.length * EQUIPMENT_FIELDS.length;

    for (const eq of equipment) {
      for (const field of EQUIPMENT_FIELDS) {
        const key = `${eq.id}::${field}`;
        const origin = latestOrigins.get(key);
        if (!origin) {
          unvalidatedFields.push({ equipmentId: eq.id, tagNumber: eq.tagNumber, fieldName: field });
        } else if (origin.sourceEntry && origin.sourceRevision !== origin.sourceEntry.revision) {
          staleItems.push({
            equipmentId: eq.id,
            tagNumber: eq.tagNumber,
            fieldName: field,
            currentRevision: origin.sourceRevision ?? '',
            latestRevision: origin.sourceEntry.revision,
            documentNumber: origin.sourceEntry.documentNumber,
          });
        } else {
          upToDateCount++;
        }
      }
    }

    return { staleItems, unvalidatedFields, upToDateCount, totalFields };
  }

  async checkStalenessForEquipment(equipmentId: string) {
    const eq = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { id: true, tagNumber: true },
    });
    if (!eq) throw new NotFoundException(`Equipment ${equipmentId} not found`);

    const origins = await this.prisma.dataOrigin.findMany({
      where: { equipmentId },
      orderBy: { validatedAt: 'desc' },
      include: {
        sourceEntry: { select: { id: true, documentNumber: true, revision: true } },
        validatedBy: { select: { id: true, name: true } },
      },
    });

    const latestOrigins = new Map<string, typeof origins[0]>();
    for (const o of origins) {
      if (!latestOrigins.has(o.fieldName)) latestOrigins.set(o.fieldName, o);
    }

    const fields: {
      fieldName: string; status: 'up_to_date' | 'stale' | 'unvalidated';
      origin?: typeof origins[0]; latestRevision?: string;
    }[] = [];

    for (const field of EQUIPMENT_FIELDS) {
      const origin = latestOrigins.get(field);
      if (!origin) {
        fields.push({ fieldName: field, status: 'unvalidated' });
      } else if (origin.sourceEntry && origin.sourceRevision !== origin.sourceEntry.revision) {
        fields.push({
          fieldName: field, status: 'stale', origin,
          latestRevision: origin.sourceEntry.revision,
        });
      } else {
        fields.push({ fieldName: field, status: 'up_to_date', origin });
      }
    }

    return { equipmentId, tagNumber: eq.tagNumber, fields };
  }
}
