import client from './client';

export interface Equipment {
  id: string;
  tagNumber: string;
  service: string;
  category: string;
  subType: string | null;
  quantity: number;
  material: string | null;
  operatingPressure: number | null;
  operatingTemperature: number | null;
  designPressure: number | null;
  designTemperature: number | null;
  estimatedWeight: number | null;
  size: string | null;
  notes: string | null;
  projectId: string;
  project?: { id: string; name: string };
  discussions?: Array<{ id: string; title: string; createdAt: string; author: { id: string; name: string } }>;
}

export const equipmentApi = {
  list: (params?: { projectId?: string; category?: string; search?: string }) =>
    client.get<Equipment[]>('/api/equipment', { params }),

  getById: (id: string) =>
    client.get<Equipment>(`/api/equipment/${id}`),

  getByTag: (tag: string) =>
    client.get<Equipment>(`/api/equipment/tag/${tag}`),

  search: (q: string) =>
    client.get<Equipment[]>('/api/equipment/search', { params: { q } }),

  update: (id: string, data: Partial<Equipment>) =>
    client.put<Equipment>(`/api/equipment/${id}`, data),
};
