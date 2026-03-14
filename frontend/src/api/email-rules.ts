import client from './client';

export type EmailRouteTarget = 'PROJECT_MANAGER' | 'DISCIPLINE_LEAD' | 'PROCUREMENT' | 'SPECIFIC_USER';
export type EmailPurpose = 'INFORMATION' | 'QUERY' | 'DOCUMENT_SUBMISSION' | 'COMMENT_REQUEST' | 'OTHER';
export type EmailDocumentIntent = 'FOR_INFORMATION' | 'AS_INPUT' | 'FOR_COMMENTS';
export type Discipline = 'PIPING' | 'ELECTRICAL' | 'INSTRUMENTATION' | 'CIVIL' | 'MECHANICAL' | 'PROCESS';

export interface EmailRoutingRule {
  id: string;
  projectId: string;
  name: string;
  priority: number;
  active: boolean;
  senderEmail: string | null;
  senderDomain: string | null;
  subjectContains: string | null;
  isExternal: boolean | null;
  target: EmailRouteTarget;
  targetUserId: string | null;
  targetDiscipline: Discipline | null;
  autoPurpose: EmailPurpose | null;
  autoIntent: EmailDocumentIntent | null;
  createdAt: string;
  targetUser?: { id: string; name: string; email: string; discipline: string } | null;
}

export interface CreateRuleDto {
  projectId: string;
  name: string;
  priority?: number;
  senderEmail?: string;
  senderDomain?: string;
  subjectContains?: string;
  isExternal?: boolean | null;
  target: EmailRouteTarget;
  targetUserId?: string;
  targetDiscipline?: Discipline;
  autoPurpose?: EmailPurpose;
  autoIntent?: EmailDocumentIntent;
  active?: boolean;
}

export const emailRulesApi = {
  list: (projectId: string) =>
    client.get<EmailRoutingRule[]>('/api/email-rules', { params: { projectId } }),

  create: (dto: CreateRuleDto) =>
    client.post<EmailRoutingRule>('/api/email-rules', dto),

  update: (id: string, dto: Partial<CreateRuleDto>) =>
    client.put<EmailRoutingRule>(`/api/email-rules/${id}`, dto),

  toggle: (id: string) =>
    client.patch<EmailRoutingRule>(`/api/email-rules/${id}/toggle`),

  remove: (id: string) =>
    client.delete(`/api/email-rules/${id}`),
};

export const TARGET_LABELS: Record<EmailRouteTarget, string> = {
  PROJECT_MANAGER: 'Chef de projet',
  DISCIPLINE_LEAD: 'Lead de discipline',
  PROCUREMENT: 'Acheteur / Procurement',
  SPECIFIC_USER: 'Utilisateur spécifique',
};

export const PURPOSE_LABELS: Record<EmailPurpose, string> = {
  INFORMATION: 'Pour information',
  QUERY: 'Question / Demande',
  DOCUMENT_SUBMISSION: 'Soumission de document',
  COMMENT_REQUEST: 'Demande de commentaires',
  OTHER: 'Autre',
};

export const INTENT_LABELS: Record<EmailDocumentIntent, string> = {
  FOR_INFORMATION: 'Pour information',
  AS_INPUT: 'Comme données d\'entrée',
  FOR_COMMENTS: 'Pour commentaires',
};

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  PIPING: 'Tuyauterie',
  ELECTRICAL: 'Électrique',
  INSTRUMENTATION: 'Instrumentation',
  CIVIL: 'Génie Civil',
  MECHANICAL: 'Mécanique',
  PROCESS: 'Process',
};
