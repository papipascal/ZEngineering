import client from './client';

export type ContractItemType = 'REQUIREMENT' | 'CHANGE';
export type ContractItemStatus =
  | 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  | 'COMPLIANT' | 'NON_COMPLIANT' | 'WAIVED'
  | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';
export type ContractItemPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ContractImpact = 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR';

export interface ContractItem {
  id: string;
  projectId: string;
  type: ContractItemType;
  itemNumber: string;
  title: string;
  description: string | null;
  clauseRef: string | null;
  specTitle: string | null;
  docRef: string | null;
  docRevision: string | null;
  docPage: string | null;
  status: ContractItemStatus;
  priority: ContractItemPriority;
  discipline: string | null;
  dueDate: string | null;
  notes: string | null;
  tags: string | null;
  reqCategory: string | null;
  reqAction: string | null;
  consequence: string | null;
  scopeLimit: string | null;
  changeRequestedBy: string | null;
  changeDate: string | null;
  commercialImpact: ContractImpact;
  commercialValue: number | null;
  scheduleImpact: ContractImpact;
  scheduleDays: number | null;
  technicalImpact: string | null;
  clientRef: string | null;
  deviationType: string | null;
  assignee: { id: string; name: string; email: string; discipline: string | null } | null;
  document: { id: string; fileName: string; s3Key: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractItemFilter {
  projectId?: string;
  type?: ContractItemType;
  status?: ContractItemStatus;
  priority?: ContractItemPriority;
  discipline?: string;
  assigneeId?: string;
  reqCategory?: string;
  search?: string;
}

export const contractItemsApi = {
  list: (filter?: ContractItemFilter) =>
    client.get<ContractItem[]>('/api/contract-items', { params: filter }),

  getById: (id: string) =>
    client.get<ContractItem>(`/api/contract-items/${id}`),

  create: (data: Partial<ContractItem> & { projectId: string; type: ContractItemType; title: string }) =>
    client.post<ContractItem>('/api/contract-items', data),

  update: (id: string, data: Partial<ContractItem>) =>
    client.patch<ContractItem>(`/api/contract-items/${id}`, data),

  remove: (id: string) =>
    client.delete(`/api/contract-items/${id}`),

  importExcel: (file: File, projectId: string, type: ContractItemType) => {
    const form = new FormData();
    form.append('file', file);
    form.append('projectId', projectId);
    form.append('type', type);
    return client.post<{ imported: number; items: ContractItem[] }>(
      '/api/contract-items/import',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};
