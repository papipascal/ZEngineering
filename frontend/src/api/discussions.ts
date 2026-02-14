import client from './client';

export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  projectId: string;
  equipmentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email?: string };
  equipment?: { id: string; tagNumber: string; service: string } | null;
  project?: { id: string; name: string };
  comments?: Comment[];
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  author: { id: string; name: string };
}

export const discussionApi = {
  list: (params?: { projectId?: string; equipmentId?: string; search?: string }) =>
    client.get<Discussion[]>('/api/discussions', { params }),

  getById: (id: string) =>
    client.get<Discussion>(`/api/discussions/${id}`),

  create: (data: { title: string; content: string; authorId: string; projectId: string; equipmentId?: string }) =>
    client.post<Discussion>('/api/discussions', data),

  addComment: (discussionId: string, data: { content: string; authorId: string }) =>
    client.post<Comment>(`/api/discussions/${discussionId}/comments`, data),

  searchAll: (q: string) =>
    client.get('/api/discussions/search', { params: { q } }),

  delete: (id: string) =>
    client.delete(`/api/discussions/${id}`),
};
