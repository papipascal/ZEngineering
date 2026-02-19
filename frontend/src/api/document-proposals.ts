import client from './client';

export interface DocumentProposal {
  id: string;
  projectId: string;
  incomingEmailId: string;
  documentId: string;
  proposedDocNumber: string | null;
  proposedTitle: string | null;
  proposedDiscipline: string | null;
  proposedTreeNodeId: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  reviewedById: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  incomingEmail: {
    id: string;
    subject: string;
    fromAddress: string;
    fromName: string | null;
    receivedAt: string;
  };
  document: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    s3Key: string;
  };
  reviewedBy: { id: string; name: string } | null;
}

export interface WhitelistEntry {
  id: string;
  projectId: string;
  emailOrDomain: string;
  label: string | null;
  addedByUserId: string;
  createdAt: string;
  addedBy: { id: string; name: string };
}

export const documentProposalsApi = {
  listProposals: (projectId: string, status?: string) =>
    client.get<DocumentProposal[]>('/api/document-proposals', {
      params: { projectId, ...(status ? { status } : {}) },
    }),

  acceptProposal: (
    id: string,
    data: { notes?: string; proposedDocNumber?: string; proposedTitle?: string; proposedDiscipline?: string },
  ) => client.patch<DocumentProposal>(`/api/document-proposals/${id}/accept`, data),

  rejectProposal: (id: string, data: { notes?: string }) =>
    client.patch<DocumentProposal>(`/api/document-proposals/${id}/reject`, data),

  listWhitelist: (projectId: string) =>
    client.get<WhitelistEntry[]>('/api/incoming-emails/whitelist', { params: { projectId } }),

  addToWhitelist: (data: { projectId: string; emailOrDomain: string; label?: string }) =>
    client.post<WhitelistEntry>('/api/incoming-emails/whitelist', data),

  removeFromWhitelist: (id: string) =>
    client.delete(`/api/incoming-emails/whitelist/${id}`),
};
