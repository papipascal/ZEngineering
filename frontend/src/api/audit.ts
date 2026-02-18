import client from './client';

export const auditApi = {
  getByProject: (projectId: string, params?: { entity?: string; limit?: number; offset?: number }) =>
    client.get(`/api/audit/project/${projectId}`, { params }),

  getByEntity: (entity: string, entityId: string) =>
    client.get(`/api/audit/entity/${entity}/${entityId}`),

  getByUser: (userId: string, limit?: number) =>
    client.get(`/api/audit/user/${userId}`, { params: { limit } }),
};
