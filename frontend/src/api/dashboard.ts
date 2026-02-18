import client from './client';

export const dashboardApi = {
  getProjectStats: (projectId: string) =>
    client.get(`/api/dashboard/project/${projectId}`),

  getUserDashboard: (userId: string, projectId?: string) =>
    client.get(`/api/dashboard/user/${userId}`, { params: { projectId } }),

  getEquipmentStats: (projectId: string) =>
    client.get(`/api/dashboard/project/${projectId}/equipment`),

  getDocumentStats: (projectId: string) =>
    client.get(`/api/dashboard/project/${projectId}/documents`),

  getWorkflowStats: (projectId: string) =>
    client.get(`/api/dashboard/project/${projectId}/workflows`),
};
