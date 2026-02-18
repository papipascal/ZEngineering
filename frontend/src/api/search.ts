import client from './client';

export interface SearchFilters {
  projectId: string;
  query?: string;
  entityTypes?: string[];
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  folder?: string;
  discipline?: string;
  status?: string;
  companyName?: string;
  equipmentTag?: string;
}

export interface SearchResultDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  folder: string | null;
  description: string | null;
  createdAt: string;
  uploadedBy: { id: string; name: string };
  equipment?: { id: string; tagNumber: string } | null;
  vendor?: { id: string; name: string } | null;
}

export interface SearchResultTransmittal {
  id: string;
  transmittalNumber: string;
  subject: string;
  purpose: string;
  recipientName: string;
  status: string;
  createdAt: string;
  sentBy: { id: string; name: string };
  vendor?: { id: string; name: string } | null;
  partner?: { id: string; name: string } | null;
}

export interface SearchResultEmail {
  id: string;
  subject: string;
  fromAddress: string;
  fromName: string | null;
  receivedAt: string;
  status: string;
  purpose: string | null;
  isExternal: boolean;
}

export interface SearchResultEquipment {
  id: string;
  tagNumber: string;
  service: string;
  category: string;
  subType: string | null;
  material: string | null;
  notes: string | null;
}

export interface SearchResultDiscussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
  equipment?: { id: string; tagNumber: string } | null;
}

export interface SearchResultRegister {
  id: string;
  documentNumber: string;
  title: string;
  discipline: string;
  revision: string;
  status: string;
  createdAt: string;
  owner: { id: string; name: string };
}

export interface SearchResults {
  documents: SearchResultDocument[];
  transmittals: SearchResultTransmittal[];
  emails: SearchResultEmail[];
  equipment: SearchResultEquipment[];
  discussions: SearchResultDiscussion[];
  register: SearchResultRegister[];
  totalCount: number;
}

export interface SavedSearch {
  id: string;
  name: string | null;
  query: string;
  filters: SearchFilters | null;
  pinned: boolean;
  user: { id: string; name: string };
  createdAt: string;
}

export const searchApi = {
  search: (params: SearchFilters) =>
    client.get<SearchResults>('/api/search', { params }),

  save: (data: { projectId: string; name: string; query: string; filters?: Record<string, unknown>; pinned?: boolean }) =>
    client.post<SavedSearch>('/api/search/save', data),

  listSaved: (projectId: string) =>
    client.get<SavedSearch[]>('/api/search/saved', { params: { projectId } }),

  listRecent: (projectId: string) =>
    client.get<SavedSearch[]>('/api/search/recent', { params: { projectId } }),

  deleteSearch: (id: string) =>
    client.delete(`/api/search/${id}`),

  togglePin: (id: string) =>
    client.patch<SavedSearch>(`/api/search/${id}/pin`),
};
