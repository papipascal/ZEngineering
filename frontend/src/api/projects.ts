import client from './client';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  clientName: string | null;
  clientContact: string | null;
  projectEmail?: string | null;
  myRole?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    equipment: number;
    discussions: number;
    documents: number;
    documentEntries: number;
  };
}

export interface ProjectMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; role: string; discipline: string | null };
}

export interface ProjectPartner {
  id: string;
  name: string;
  role: string | null;
  contactName: string | null;
  contactEmail: string | null;
}

export interface ProjectVendorEntry {
  id: string;
  notes: string | null;
  vendor: { id: string; name: string; country: string | null; specialties?: { equipmentType: string }[] };
}

export interface ProjectDetail extends Project {
  myRole?: string;
  members: ProjectMember[];
  partners: ProjectPartner[];
  projectVendors: ProjectVendorEntry[];
}

export const projectApi = {
  list: () =>
    client.get<Project[]>('/api/projects'),
  getById: (id: string) =>
    client.get<ProjectDetail>(`/api/projects/${id}`),
  create: (data: { name: string; description?: string; clientName?: string; clientContact?: string }) =>
    client.post<Project>('/api/projects', data),
  update: (id: string, data: Partial<Project>) =>
    client.patch<Project>(`/api/projects/${id}`, data),
  addMember: (id: string, data: { userId: string; role?: string }) =>
    client.post(`/api/projects/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    client.delete(`/api/projects/${id}/members/${userId}`),
  addPartner: (id: string, data: { name: string; role?: string; contactName?: string; contactEmail?: string }) =>
    client.post(`/api/projects/${id}/partners`, data),
  removePartner: (id: string, partnerId: string) =>
    client.delete(`/api/projects/${id}/partners/${partnerId}`),
  assignVendor: (id: string, data: { vendorId: string; notes?: string }) =>
    client.post(`/api/projects/${id}/vendors`, data),
  removeVendor: (id: string, vendorId: string) =>
    client.delete(`/api/projects/${id}/vendors/${vendorId}`),
};
