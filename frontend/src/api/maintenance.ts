import client from './client';

export type MaintenanceFrequency =
  | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  | 'SEMI_ANNUAL' | 'ANNUAL' | 'BIENNIAL' | 'ON_CONDITION';

export interface MaintenancePlan {
  id: string;
  equipmentId: string;
  equipment?: { id: string; tagNumber: string; service: string };
  title: string;
  description: string | null;
  frequency: MaintenanceFrequency;
  estimatedDurationH: number | null;
  requiredSkills: string | null;
  requiredTools: string | null;
  safetyNotes: string | null;
  lastPerformedAt: string | null;
  nextDueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenancePlanDto {
  equipmentId: string;
  title: string;
  description?: string;
  frequency: MaintenanceFrequency;
  estimatedDurationH?: number;
  requiredSkills?: string;
  requiredTools?: string;
  safetyNotes?: string;
  lastPerformedAt?: string;
  nextDueAt?: string;
}

export const maintenanceApi = {
  list: (params?: { equipmentId?: string; frequency?: MaintenanceFrequency }) =>
    client.get<MaintenancePlan[]>('/api/maintenance', { params }),

  getById: (id: string) =>
    client.get<MaintenancePlan>(`/api/maintenance/${id}`),

  create: (data: CreateMaintenancePlanDto) =>
    client.post<MaintenancePlan>('/api/maintenance', data),

  update: (id: string, data: Partial<CreateMaintenancePlanDto>) =>
    client.put<MaintenancePlan>(`/api/maintenance/${id}`, data),

  remove: (id: string) =>
    client.delete(`/api/maintenance/${id}`),
};
