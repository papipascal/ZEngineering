import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DEFAULT_ORG_ROLES, DEFAULT_PROJECT_TREE } from './organization-roles.js';
import { UpdateOrgDto, UpdateTreeDto } from './dto/update-org.dto.js';

interface TreeTemplateDef {
  name: string;
  level: number;
  order: number;
  children?: TreeTemplateDef[];
}

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // Default roles
  // ==========================================

  getDefaultRoles() {
    return DEFAULT_ORG_ROLES;
  }

  getDefaultTree() {
    return DEFAULT_PROJECT_TREE;
  }

  // ==========================================
  // Project Organization (org chart)
  // ==========================================

  async getProjectOrg(projectId: string) {
    await this.ensureProjectExists(projectId);
    return this.prisma.projectOrganization.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async updateProjectOrg(projectId: string, dto: UpdateOrgDto) {
    await this.ensureProjectExists(projectId);

    // Delete all existing positions and recreate
    await this.prisma.projectOrganization.deleteMany({ where: { projectId } });

    const created = await Promise.all(
      dto.positions.map((pos) =>
        this.prisma.projectOrganization.create({
          data: {
            projectId,
            role: pos.role,
            label: pos.label,
            parentRole: pos.parentRole ?? null,
            userId: pos.userId ?? null,
            order: pos.order ?? 0,
          },
        }),
      ),
    );

    return created;
  }

  // ==========================================
  // Project Tree
  // ==========================================

  async getProjectTree(projectId: string) {
    await this.ensureProjectExists(projectId);
    return this.prisma.projectTree.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async updateProjectTree(projectId: string, dto: UpdateTreeDto) {
    await this.ensureProjectExists(projectId);

    // Delete all existing nodes and recreate
    await this.prisma.projectTree.deleteMany({ where: { projectId } });

    const created = await Promise.all(
      dto.nodes.map((node) =>
        this.prisma.projectTree.create({
          data: {
            projectId,
            name: node.name,
            parentId: node.parentId ?? null,
            level: node.level,
            order: node.order ?? 0,
          },
        }),
      ),
    );

    return created;
  }

  // ==========================================
  // Initialize project from defaults
  // ==========================================

  async initProjectOrganization(projectId: string) {
    await this.ensureProjectExists(projectId);

    // Check if already initialized
    const existing = await this.prisma.projectOrganization.count({ where: { projectId } });
    if (existing > 0) {
      return { message: 'Organization already initialized', count: existing };
    }

    // Create org positions from defaults
    const positions = await Promise.all(
      DEFAULT_ORG_ROLES.map((r) =>
        this.prisma.projectOrganization.create({
          data: {
            projectId,
            role: r.role,
            label: r.label,
            parentRole: r.parentRole,
            order: r.order,
          },
        }),
      ),
    );

    // Create project tree from defaults
    await this.createTreeFromTemplate(projectId, DEFAULT_PROJECT_TREE as TreeTemplateDef[], null);

    return { message: 'Organization initialized', orgPositions: positions.length };
  }

  // ==========================================
  // Tree Template CRUD
  // ==========================================

  async getTreeTemplate() {
    return this.prisma.projectTreeTemplate.findMany({
      orderBy: { order: 'asc' },
    });
  }

  // ==========================================
  // Authorization helpers
  // ==========================================

  /**
   * Returns true if the user can edit the org chart for the given project.
   * Priority:
   *   1. User assigned to chef_de_projet in the org chart
   *   2. If no chef assigned → fall back to ProjectMember.role owner/manager
   * Global admin bypass is handled in the controller.
   */
  async isUserAuthorizedToEditOrg(projectId: string, userId: string): Promise<boolean> {
    const chefPosition = await this.prisma.projectOrganization.findUnique({
      where: { projectId_role: { projectId, role: 'chef_de_projet' } },
    });

    if (chefPosition?.userId) {
      return chefPosition.userId === userId;
    }

    // No chef assigned: fall back to project member role
    return this.isUserProjectManager(projectId, userId);
  }

  /**
   * Returns true if user has ProjectMember.role owner or manager.
   * Used for /init endpoint (before a chef is assigned).
   */
  async isUserProjectManager(projectId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return membership?.role === 'owner' || membership?.role === 'manager';
  }

  // ==========================================
  // Helpers
  // ==========================================

  private async ensureProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);
    return project;
  }

  private async createTreeFromTemplate(
    projectId: string,
    nodes: TreeTemplateDef[],
    parentId: string | null,
  ) {
    for (const node of nodes) {
      const created = await this.prisma.projectTree.create({
        data: {
          projectId,
          name: node.name,
          parentId,
          level: node.level,
          order: node.order,
        },
      });
      if (node.children && node.children.length > 0) {
        await this.createTreeFromTemplate(projectId, node.children, created.id);
      }
    }
  }
}
