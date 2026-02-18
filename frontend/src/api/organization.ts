import client from './client';

export interface OrgPosition {
  role: string;
  label: string;
  parentRole: string | null;
  userId: string | null;
  order: number;
  user?: { id: string; name: string; email: string } | null;
}

export const organizationApi = {
  getDefaultRoles: () =>
    client.get('/api/organization/roles'),

  getTreeTemplate: () =>
    client.get('/api/organization/tree-template'),

  getDefaultTree: () =>
    client.get('/api/organization/default-tree'),

  getProjectOrg: (projectId: string) =>
    client.get(`/api/organization/project/${projectId}`),

  updateProjectOrg: (projectId: string, positions: OrgPosition[]) =>
    client.put(`/api/organization/project/${projectId}`, { positions }),

  getProjectTree: (projectId: string) =>
    client.get(`/api/organization/project/${projectId}/tree`),

  updateProjectTree: (projectId: string, nodes: Array<{ name: string; parentId?: string; level: number; order?: number }>) =>
    client.put(`/api/organization/project/${projectId}/tree`, { nodes }),

  initProject: (projectId: string) =>
    client.post(`/api/organization/project/${projectId}/init`),
};
