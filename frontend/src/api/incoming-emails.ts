import client from './client';

export interface IncomingEmail {
  id: string;
  projectId: string;
  messageId: string;
  fromAddress: string;
  fromName?: string | null;
  toAddress: string;
  subject: string;
  bodyText?: string | null;
  bodyHtml?: string | null;
  receivedAt: string;
  status: string;
  purpose?: string | null;
  documentIntent?: string | null;
  isExternal?: boolean;
  notes?: string | null;
  createdAt: string;
  project?: { id: string; name: string } | null;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    s3Key: string;
    createdAt: string;
  }>;
  _count?: { attachments: number };
}

export const incomingEmailApi = {
  list: (params?: { projectId?: string; status?: string; purpose?: string; isExternal?: string; search?: string }) =>
    client.get<IncomingEmail[]>('/api/incoming-emails', { params }),

  getById: (id: string) =>
    client.get<IncomingEmail>(`/api/incoming-emails/${id}`),

  update: (id: string, data: { status?: string; purpose?: string; documentIntent?: string; notes?: string }) =>
    client.patch<IncomingEmail>(`/api/incoming-emails/${id}`, data),

  updateStatus: (id: string, status: 'READ' | 'ARCHIVED') =>
    client.patch<IncomingEmail>(`/api/incoming-emails/${id}`, { status }),

  getStatus: () =>
    client.get<{ configured: boolean; host?: string; polling: boolean }>('/api/incoming-emails/status'),
};
