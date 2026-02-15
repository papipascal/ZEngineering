import client from './client';

export interface TransmittalItem {
  id: string;
  transmittalId: string;
  documentId?: string | null;
  registerEntryId?: string | null;
  remarks?: string | null;
  document?: { id: string; fileName: string; fileSize: number; s3Key: string } | null;
  registerEntry?: { id: string; documentNumber: string; title: string; revision: string } | null;
}

export interface Transmittal {
  id: string;
  projectId: string;
  transmittalNumber: string;
  subject: string;
  purpose: string;
  recipientName: string;
  recipientEmail: string;
  recipientType: string;
  vendorId?: string | null;
  partnerId?: string | null;
  coverLetter?: string | null;
  sentById: string;
  sentAt?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  sentBy: { id: string; name: string; email?: string };
  vendor?: { id: string; name: string } | null;
  partner?: { id: string; name: string } | null;
  project?: { id: string; name: string; projectEmail?: string | null } | null;
  items?: TransmittalItem[];
  _count?: { items: number };
}

export interface CreateTransmittalData {
  projectId: string;
  subject: string;
  purpose: string;
  recipientName: string;
  recipientEmail: string;
  recipientType: string;
  vendorId?: string;
  partnerId?: string;
  coverLetter?: string;
  sentById: string;
  items?: Array<{ documentId?: string; registerEntryId?: string; remarks?: string }>;
}

export const transmittalApi = {
  list: (params?: { projectId?: string; status?: string; purpose?: string; search?: string }) =>
    client.get<Transmittal[]>('/api/transmittals', { params }),

  getById: (id: string) =>
    client.get<Transmittal>(`/api/transmittals/${id}`),

  create: (data: CreateTransmittalData) =>
    client.post<Transmittal>('/api/transmittals', data),

  update: (id: string, data: Partial<CreateTransmittalData>) =>
    client.patch<Transmittal>(`/api/transmittals/${id}`, data),

  send: (id: string) =>
    client.post<Transmittal>(`/api/transmittals/${id}/send`),

  remove: (id: string) =>
    client.delete(`/api/transmittals/${id}`),
};
