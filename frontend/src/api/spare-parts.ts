import client from './client';

export type SparePartCriticality = 'CRITICAL' | 'IMPORTANT' | 'STANDARD' | 'CONSUMABLE';

export interface SparePart {
  id: string;
  equipmentId: string;
  equipment?: { id: string; tagNumber: string; service: string };
  partNumber: string;
  description: string;
  manufacturer: string | null;
  supplierRef: string | null;
  criticality: SparePartCriticality;
  recommendedQty: number;
  stockQty: number;
  unitCost: number | null;
  currency: string;
  leadTimeDays: number | null;
  storageLocation: string | null;
  storageCondition: string | null;
  commissioningQty: number | null;
  operationQty: number | null;
  capitalSpareQty: number | null;
  notes: string | null;
  documentId: string | null;
  document?: { id: string; fileName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSparePartDto {
  equipmentId: string;
  partNumber: string;
  description: string;
  manufacturer?: string;
  supplierRef?: string;
  criticality?: SparePartCriticality;
  recommendedQty?: number;
  stockQty?: number;
  unitCost?: number;
  currency?: string;
  leadTimeDays?: number;
  storageLocation?: string;
  storageCondition?: string;
  commissioningQty?: number;
  operationQty?: number;
  capitalSpareQty?: number;
  notes?: string;
  documentId?: string;
}

export const sparePartsApi = {
  list: (params?: { equipmentId?: string; criticality?: SparePartCriticality; search?: string }) =>
    client.get<SparePart[]>('/api/spare-parts', { params }),

  getById: (id: string) =>
    client.get<SparePart>(`/api/spare-parts/${id}`),

  create: (data: CreateSparePartDto) =>
    client.post<SparePart>('/api/spare-parts', data),

  update: (id: string, data: Partial<CreateSparePartDto>) =>
    client.put<SparePart>(`/api/spare-parts/${id}`, data),

  remove: (id: string) =>
    client.delete(`/api/spare-parts/${id}`),
};
