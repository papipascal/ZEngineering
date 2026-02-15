import client from './client';

export interface DocumentRegisterEntry {
  id: string;
  projectId: string;
  documentNumber: string;
  title: string;
  discipline: string;
  revision: string;
  status: string;
  issueDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string; discipline: string | null };
  issuer: { id: string; name: string; email: string } | null;
  project: { id: string; name: string };
  revisions?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
    uploadedBy: { id: string; name: string };
  }>;
}

export interface RegisterFilter {
  projectId?: string;
  discipline?: string;
  status?: string;
  ownerId?: string;
  search?: string;
}

export const documentRegisterApi = {
  list: (filter?: RegisterFilter) =>
    client.get<DocumentRegisterEntry[]>('/api/document-register', { params: filter }),
  getById: (id: string) =>
    client.get<DocumentRegisterEntry>(`/api/document-register/${id}`),
  create: (data: {
    projectId: string;
    documentNumber: string;
    title: string;
    discipline: string;
    ownerId: string;
    issuerId?: string;
    revision?: string;
    status?: string;
    issueDate?: string;
    description?: string;
  }) =>
    client.post<DocumentRegisterEntry>('/api/document-register', data),
  update: (id: string, data: Partial<DocumentRegisterEntry>) =>
    client.patch<DocumentRegisterEntry>(`/api/document-register/${id}`, data),
  remove: (id: string) =>
    client.delete(`/api/document-register/${id}`),
};
