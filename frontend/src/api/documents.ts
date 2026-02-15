import client from './client';

export interface Document {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  category: string | null;
  description: string | null;
  projectId: string;
  equipmentId: string | null;
  vendorId: string | null;
  discussionId: string | null;
  commentId: string | null;
  uploadedById: string;
  uploadedBy: { id: string; name: string };
  project?: { id: string; name: string };
  equipment?: { id: string; tagNumber: string } | null;
  vendor?: { id: string; name: string } | null;
  discussion?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilter {
  projectId?: string;
  equipmentId?: string;
  vendorId?: string;
  discussionId?: string;
  category?: string;
  search?: string;
}

export const documentApi = {
  upload: (file: File, data: {
    projectId: string;
    category?: string;
    description?: string;
    equipmentId?: string;
    vendorId?: string;
    discussionId?: string;
    commentId?: string;
    registerEntryId?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    return client.post<Document>('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  list: (params?: DocumentFilter) =>
    client.get<Document[]>('/api/documents', { params }),

  getById: (id: string) =>
    client.get<Document>(`/api/documents/${id}`),

  download: (id: string) =>
    client.get(`/api/documents/${id}/download`, { responseType: 'blob' }),

  getPresignedUrl: (id: string) =>
    client.get<{ url: string; expiresIn: number }>(`/api/documents/${id}/presigned-url`),

  share: (id: string, data: { recipientEmail: string; message?: string }) =>
    client.post(`/api/documents/${id}/share`, data),

  remove: (id: string) =>
    client.delete(`/api/documents/${id}`),
};
