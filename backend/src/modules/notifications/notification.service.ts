import { Injectable } from '@nestjs/common';
import { Subject, Observable, filter, map } from 'rxjs';

export interface AppNotification {
  id: string;
  type: 'workflow_assigned' | 'workflow_completed' | 'workflow_rejected' |
        'email_received' | 'document_submitted' | 'change_request' | 'transmittal_sent';
  title: string;
  message: string;
  projectId?: string;
  targetUserId?: string; // null = broadcast to project
  data?: Record<string, unknown>;
  createdAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly notifications$ = new Subject<AppNotification>();
  private counter = 0;

  emit(notification: Omit<AppNotification, 'id' | 'createdAt'>) {
    this.notifications$.next({
      ...notification,
      id: `notif-${++this.counter}-${Date.now()}`,
      createdAt: new Date(),
    });
  }

  /** Subscribe to notifications for a specific user (includes broadcasts for their projects) */
  subscribe(userId: string, projectIds: string[]): Observable<AppNotification> {
    return this.notifications$.pipe(
      filter((n) => {
        // Direct notification for this user
        if (n.targetUserId === userId) return true;
        // Broadcast to a project the user belongs to
        if (!n.targetUserId && n.projectId && projectIds.includes(n.projectId)) return true;
        return false;
      }),
    );
  }

  // ==========================================
  // Convenience methods
  // ==========================================

  notifyWorkflowAssigned(params: {
    userId: string;
    projectId: string;
    workflowName: string;
    stepName: string;
    instanceId: string;
  }) {
    this.emit({
      type: 'workflow_assigned',
      title: 'Nouvelle tache workflow',
      message: `Etape "${params.stepName}" du workflow "${params.workflowName}" vous a ete assignee.`,
      targetUserId: params.userId,
      projectId: params.projectId,
      data: { instanceId: params.instanceId, stepName: params.stepName },
    });
  }

  notifyWorkflowCompleted(params: {
    projectId: string;
    workflowName: string;
    instanceId: string;
  }) {
    this.emit({
      type: 'workflow_completed',
      title: 'Workflow termine',
      message: `Le workflow "${params.workflowName}" est termine.`,
      projectId: params.projectId,
      data: { instanceId: params.instanceId },
    });
  }

  notifyWorkflowRejected(params: {
    projectId: string;
    workflowName: string;
    instanceId: string;
    stepName: string;
  }) {
    this.emit({
      type: 'workflow_rejected',
      title: 'Workflow rejete',
      message: `Le workflow "${params.workflowName}" a ete rejete a l'etape "${params.stepName}".`,
      projectId: params.projectId,
      data: { instanceId: params.instanceId },
    });
  }

  notifyEmailReceived(params: {
    projectId: string;
    targetUserId?: string;
    subject: string;
    fromAddress: string;
    emailId: string;
  }) {
    this.emit({
      type: 'email_received',
      title: 'Nouvel email recu',
      message: `Email de ${params.fromAddress}: "${params.subject}"`,
      projectId: params.projectId,
      targetUserId: params.targetUserId,
      data: { emailId: params.emailId },
    });
  }

  notifyDocumentSubmitted(params: {
    projectId: string;
    documentNumber: string;
    title: string;
  }) {
    this.emit({
      type: 'document_submitted',
      title: 'Document soumis',
      message: `Document "${params.documentNumber} - ${params.title}" soumis pour revue.`,
      projectId: params.projectId,
      data: { documentNumber: params.documentNumber },
    });
  }

  notifyTransmittalSent(params: {
    projectId: string;
    transmittalNumber: string;
    recipientName: string;
  }) {
    this.emit({
      type: 'transmittal_sent',
      title: 'Transmittal envoye',
      message: `Transmittal "${params.transmittalNumber}" envoye a ${params.recipientName}.`,
      projectId: params.projectId,
      data: { transmittalNumber: params.transmittalNumber },
    });
  }
}
