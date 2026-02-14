import client from './client';

export interface WorkflowStep {
  id: string;
  instanceId: string;
  name: string;
  order: number;
  status: string;
  assigneeId: string | null;
  action: string | null;
  comment: string | null;
  startedAt: string | null;
  completedAt: string | null;
  instance?: {
    id: string;
    status: string;
    definition: { name: string };
    project: { name: string } | null;
    changeRequest?: { id: string; fieldName: string; newValue: string; equipment: { tagNumber: string } } | null;
  };
  assignee?: { id: string; name: string; email: string } | null;
}

export const workflowApi = {
  getMyTasks: (userId: string) =>
    client.get<WorkflowStep[]>(`/api/workflows/tasks/my/${userId}`),

  getActiveTasks: () =>
    client.get<WorkflowStep[]>('/api/workflows/tasks/active'),

  completeStep: (instanceId: string, stepId: string, data: { action: string; comment?: string; assigneeId?: string }) =>
    client.post(`/api/workflows/instances/${instanceId}/steps/${stepId}/complete`, data),

  getInstance: (id: string) =>
    client.get(`/api/workflows/instances/${id}`),
};
