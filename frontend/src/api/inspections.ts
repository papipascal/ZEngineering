import client from './client';

export type InspectionType =
  | 'VISUAL' | 'NDT_UT' | 'NDT_RT' | 'NDT_PT' | 'NDT_MT'
  | 'PRESSURE_TEST' | 'FUNCTIONAL_TEST' | 'FAT' | 'SAT' | 'PMI';

export type InspectionResult = 'PASS' | 'PASS_WITH_REMARKS' | 'FAIL' | 'PENDING_REVIEW';

export interface InspectionRecord {
  id: string;
  equipmentId: string;
  equipment?: { id: string; tagNumber: string; service: string };
  type: InspectionType;
  result: InspectionResult;
  inspectionDate: string;
  inspector: string | null;
  inspectorId: string | null;
  user?: { id: string; name: string } | null;
  nextInspectionDate: string | null;
  certificate: string | null;
  description: string | null;
  remarks: string | null;
  documentId: string | null;
  document?: { id: string; fileName: string } | null;
  createdAt: string;
}

export interface CreateInspectionDto {
  equipmentId: string;
  type: InspectionType;
  result: InspectionResult;
  inspectionDate: string;
  inspector?: string;
  inspectorId?: string;
  nextInspectionDate?: string;
  certificate?: string;
  description?: string;
  remarks?: string;
  documentId?: string;
}

export const inspectionsApi = {
  list: (params?: { equipmentId?: string; type?: InspectionType; result?: InspectionResult }) =>
    client.get<InspectionRecord[]>('/api/inspections', { params }),

  getById: (id: string) =>
    client.get<InspectionRecord>(`/api/inspections/${id}`),

  create: (data: CreateInspectionDto) =>
    client.post<InspectionRecord>('/api/inspections', data),

  update: (id: string, data: Partial<CreateInspectionDto>) =>
    client.put<InspectionRecord>(`/api/inspections/${id}`, data),

  remove: (id: string) =>
    client.delete(`/api/inspections/${id}`),
};
