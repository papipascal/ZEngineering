import { Injectable, Logger } from '@nestjs/common';
import { Discipline } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WorkflowService } from '../workflows/workflow.service.js';

const DISCIPLINE_KEYWORDS: Record<string, Discipline> = {
  // PIPING
  piping: 'PIPING', tuyauterie: 'PIPING', pipe: 'PIPING',
  // ELECTRICAL
  electrical: 'ELECTRICAL', électrique: 'ELECTRICAL', electrique: 'ELECTRICAL', cable: 'ELECTRICAL',
  // INSTRUMENTATION
  instrument: 'INSTRUMENTATION', control: 'INSTRUMENTATION', dcs: 'INSTRUMENTATION', plc: 'INSTRUMENTATION',
  // CIVIL
  civil: 'CIVIL', 'génie civil': 'CIVIL', 'genie civil': 'CIVIL', foundation: 'CIVIL', structure: 'CIVIL',
  // MECHANICAL
  mechanical: 'MECHANICAL', mécanique: 'MECHANICAL', mecanique: 'MECHANICAL', rotating: 'MECHANICAL',
  // PROCESS
  process: 'PROCESS', procédé: 'PROCESS', procede: 'PROCESS', 'p&id': 'PROCESS', pfd: 'PROCESS',
};

interface RouteResult {
  assigneeId: string;
  routedVia: string;
  autoPurpose?: string;
  autoIntent?: string;
}

@Injectable()
export class EmailRouterService {
  private readonly logger = new Logger(EmailRouterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: WorkflowService,
  ) {}

  async routeEmail(emailId: string, projectId: string): Promise<void> {
    const email = await this.prisma.incomingEmail.findUnique({ where: { id: emailId } });
    if (!email) return;

    const route = await this.resolveRoute(email, projectId);
    if (!route) {
      this.logger.debug(`No route found for email "${email.subject}" from ${email.fromAddress}`);
      return;
    }

    // Start a workflow for the routed email
    let workflowInstanceId: string | undefined;
    try {
      // Find or use the first workflow definition (email-review type)
      const definition = await this.prisma.workflowDefinition.findFirst({
        where: { name: { contains: 'email', mode: 'insensitive' } },
      });
      if (definition) {
        const instance = await this.workflowService.startWorkflow({
          definitionId: definition.id,
          projectId,
          context: {
            incomingEmailId: emailId,
            fromAddress: email.fromAddress,
            subject: email.subject,
            routedVia: route.routedVia,
          },
        });
        workflowInstanceId = instance.id;

        // Assign first step to the target user
        const firstStep = instance.steps[0];
        if (firstStep) {
          await this.prisma.workflowStep.update({
            where: { id: firstStep.id },
            data: { assigneeId: route.assigneeId },
          });
        }
      }
    } catch (err) {
      this.logger.warn(`Could not start workflow for email ${emailId}: ${err instanceof Error ? err.message : err}`);
    }

    // Update the email with routing info
    await this.prisma.incomingEmail.update({
      where: { id: emailId },
      data: {
        assignedToId: route.assigneeId,
        routedVia: route.routedVia,
        ...(route.autoPurpose && { purpose: route.autoPurpose as any }),
        ...(route.autoIntent && { documentIntent: route.autoIntent as any }),
        ...(workflowInstanceId && { workflowInstanceId }),
      },
    });

    this.logger.log(`Routed email "${email.subject}" → ${route.routedVia} (user: ${route.assigneeId})`);
  }

  private async resolveRoute(
    email: { fromAddress: string; subject: string; bodyText: string | null; isExternal: boolean },
    projectId: string,
  ): Promise<RouteResult | null> {
    // 1. Custom routing rules (highest priority first)
    const rules = await this.prisma.emailRoutingRule.findMany({
      where: { projectId, active: true },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      if (this.matchesRule(rule, email)) {
        const assigneeId = await this.resolveTarget(rule.target, projectId, rule.targetUserId, rule.targetDiscipline);
        if (assigneeId) {
          return {
            assigneeId,
            routedVia: `rule:${rule.name}`,
            autoPurpose: rule.autoPurpose ?? undefined,
            autoIntent: rule.autoIntent ?? undefined,
          };
        }
      }
    }

    // 2. Auto-detect partner (client)
    const senderDomain = email.fromAddress.split('@')[1]?.toLowerCase();
    const partner = await this.prisma.projectPartner.findFirst({
      where: {
        projectId,
        contactEmail: { equals: email.fromAddress, mode: 'insensitive' },
      },
    });
    if (partner) {
      const pmId = await this.getProjectManager(projectId);
      if (pmId) return { assigneeId: pmId, routedVia: `auto:partner(${partner.name})` };
    }

    // Also match by domain for partners
    if (senderDomain) {
      const partnerByDomain = await this.prisma.projectPartner.findFirst({
        where: {
          projectId,
          contactEmail: { contains: `@${senderDomain}`, mode: 'insensitive' },
        },
      });
      if (partnerByDomain) {
        const pmId = await this.getProjectManager(projectId);
        if (pmId) return { assigneeId: pmId, routedVia: `auto:partner(${partnerByDomain.name})` };
      }
    }

    // 3. Auto-detect vendor
    if (senderDomain) {
      const vendor = await this.prisma.vendor.findFirst({
        where: {
          contactEmail: { contains: `@${senderDomain}`, mode: 'insensitive' },
          projectVendors: { some: { projectId } },
        },
      });
      if (vendor) {
        // Route to procurement/manager
        const pmId = await this.getProjectManager(projectId);
        if (pmId) return { assigneeId: pmId, routedVia: `auto:vendor(${vendor.name})`, autoPurpose: 'DOCUMENT_SUBMISSION' };
      }
    }

    // 4. Auto-detect discipline from subject + body keywords
    const textToScan = `${email.subject} ${email.bodyText ?? ''}`.toLowerCase();
    for (const [keyword, discipline] of Object.entries(DISCIPLINE_KEYWORDS)) {
      if (textToScan.includes(keyword.toLowerCase())) {
        const leadId = await this.getDisciplineLead(projectId, discipline);
        if (leadId) return { assigneeId: leadId, routedVia: `auto:discipline(${discipline})` };
      }
    }

    // 5. Fallback: project manager
    const fallbackId = await this.getProjectManager(projectId);
    if (fallbackId) return { assigneeId: fallbackId, routedVia: 'auto:fallback' };

    return null;
  }

  private matchesRule(
    rule: {
      senderEmail: string | null;
      senderDomain: string | null;
      subjectContains: string | null;
      isExternal: boolean | null;
    },
    email: { fromAddress: string; subject: string; isExternal: boolean },
  ): boolean {
    if (rule.senderEmail && email.fromAddress.toLowerCase() !== rule.senderEmail.toLowerCase()) return false;
    if (rule.senderDomain) {
      const domain = email.fromAddress.split('@')[1]?.toLowerCase();
      if (domain !== rule.senderDomain.toLowerCase()) return false;
    }
    if (rule.subjectContains && !email.subject.toLowerCase().includes(rule.subjectContains.toLowerCase())) return false;
    if (rule.isExternal !== null && email.isExternal !== rule.isExternal) return false;
    return true;
  }

  private async resolveTarget(
    target: string,
    projectId: string,
    targetUserId: string | null,
    targetDiscipline: Discipline | null,
  ): Promise<string | null> {
    switch (target) {
      case 'PROJECT_MANAGER':
        return this.getProjectManager(projectId);
      case 'DISCIPLINE_LEAD':
        return targetDiscipline ? this.getDisciplineLead(projectId, targetDiscipline) : null;
      case 'PROCUREMENT':
        return this.getProjectManager(projectId); // Procurement = manager for now
      case 'SPECIFIC_USER':
        return targetUserId;
      default:
        return null;
    }
  }

  private async getProjectManager(projectId: string): Promise<string | null> {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, role: { in: ['owner', 'manager'] } },
      select: { userId: true },
    });
    return member?.userId ?? null;
  }

  private async getDisciplineLead(projectId: string, discipline: Discipline): Promise<string | null> {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        user: { discipline },
      },
      select: { userId: true },
    });
    return member?.userId ?? null;
  }
}
