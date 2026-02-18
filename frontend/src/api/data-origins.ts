import client from './client';

export interface DataOrigin {
  id: string;
  equipmentId: string;
  fieldName: string;
  fieldValue: string;
  sourceEntry: { id: string; documentNumber: string; title: string; revision: string; issueDate: string | null } | null;
  sourceDocument: { id: string; fileName: string } | null;
  sourceRef: string | null;
  sourceRevision: string | null;
  sourceIssueDate: string | null;
  sourcePage: string | null;
  validatedBy: { id: string; name: string };
  validatedAt: string;
  notes: string | null;
}

export interface StalenessField {
  fieldName: string;
  status: 'up_to_date' | 'stale' | 'unvalidated';
  origin?: DataOrigin;
  latestRevision?: string;
}

export interface EquipmentStaleness {
  equipmentId: string;
  tagNumber: string;
  fields: StalenessField[];
}

export interface StalenessReport {
  staleItems: { equipmentId: string; tagNumber: string; fieldName: string; currentRevision: string; latestRevision: string; documentNumber: string }[];
  unvalidatedFields: { equipmentId: string; tagNumber: string; fieldName: string }[];
  upToDateCount: number;
  totalFields: number;
}

export interface CreateDataOriginPayload {
  equipmentId: string;
  fieldName: string;
  fieldValue: string;
  sourceEntryId?: string;
  sourceDocumentId?: string;
  sourceRef?: string;
  sourceRevision?: string;
  sourceIssueDate?: string;
  sourcePage?: string;
  notes?: string;
}

export const dataOriginsApi = {
  create: (data: CreateDataOriginPayload) =>
    client.post<DataOrigin>('/api/data-origins', data),

  list: (params?: { equipmentId?: string; fieldName?: string; validatedById?: string }) =>
    client.get<DataOrigin[]>('/api/data-origins', { params }),

  latestPerField: (equipmentId: string) =>
    client.get<Record<string, DataOrigin>>(`/api/data-origins/latest/${equipmentId}`),

  history: (equipmentId: string, fieldName: string) =>
    client.get<DataOrigin[]>(`/api/data-origins/history/${equipmentId}/${fieldName}`),

  stalenessCheck: (projectId: string) =>
    client.get<StalenessReport>('/api/data-origins/staleness-check', { params: { projectId } }),

  equipmentStaleness: (equipmentId: string) =>
    client.get<EquipmentStaleness>(`/api/data-origins/staleness-check/${equipmentId}`),

  remove: (id: string) =>
    client.delete(`/api/data-origins/${id}`),
};
