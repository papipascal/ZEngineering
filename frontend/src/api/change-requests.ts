import client from './client';

export interface ChangeRequest {
  id: string;
  equipmentId: string;
  requesterId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string;
  justification: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  workflowInstanceId: string | null;
  createdAt: string;
  equipment: { id: string; tagNumber: string; service: string };
  requester: { id: string; name: string; email?: string };
  workflowInstance?: {
    id: string;
    status: string;
    currentStepIdx: number;
    steps?: Array<{ id: string; name: string; status: string; order: number }>;
    definition?: { name: string };
  } | null;
}

export const changeRequestApi = {
  create: (data: { equipmentId: string; fieldName: string; newValue: string; justification?: string }) =>
    client.post<ChangeRequest>('/api/change-requests', data),

  list: (projectId?: string) =>
    client.get<ChangeRequest[]>('/api/change-requests', { params: projectId ? { projectId } : {} }),

  getById: (id: string) =>
    client.get<ChangeRequest>(`/api/change-requests/${id}`),
};
