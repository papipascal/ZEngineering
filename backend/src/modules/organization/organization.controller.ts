import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OrganizationService } from './organization.service.js';
import { UpdateOrgDto, UpdateTreeDto } from './dto/update-org.dto.js';

@ApiTags('Organization')
@Controller('api/organization')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('roles')
  @ApiOperation({ summary: 'Get default organization roles template' })
  getDefaultRoles() {
    return this.orgService.getDefaultRoles();
  }

  @Get('tree-template')
  @ApiOperation({ summary: 'Get default project tree template' })
  getTreeTemplate() {
    return this.orgService.getTreeTemplate();
  }

  @Get('default-tree')
  @ApiOperation({ summary: 'Get default project tree structure (static)' })
  getDefaultTree() {
    return this.orgService.getDefaultTree();
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get project organization chart' })
  getProjectOrg(@Param('projectId') projectId: string) {
    return this.orgService.getProjectOrg(projectId);
  }

  @Put('project/:projectId')
  @ApiOperation({ summary: 'Update project organization (Chef de Projet only)' })
  async updateProjectOrg(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateOrgDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== 'admin') {
      const authorized = await this.orgService.isUserAuthorizedToEditOrg(projectId, req.user.id);
      if (!authorized) {
        throw new ForbiddenException('Seul le Chef de Projet peut modifier l\'organigramme');
      }
    }
    return this.orgService.updateProjectOrg(projectId, dto);
  }

  @Get('project/:projectId/tree')
  @ApiOperation({ summary: 'Get project tree structure' })
  getProjectTree(@Param('projectId') projectId: string) {
    return this.orgService.getProjectTree(projectId);
  }

  @Put('project/:projectId/tree')
  @ApiOperation({ summary: 'Update project tree structure (Chef de Projet only)' })
  async updateProjectTree(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateTreeDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== 'admin') {
      const authorized = await this.orgService.isUserAuthorizedToEditOrg(projectId, req.user.id);
      if (!authorized) {
        throw new ForbiddenException('Seul le Chef de Projet peut modifier l\'arborescence');
      }
    }
    return this.orgService.updateProjectTree(projectId, dto);
  }

  @Post('project/:projectId/init')
  @ApiOperation({ summary: 'Initialize project organization and tree from defaults' })
  async initProject(
    @Param('projectId') projectId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== 'admin') {
      const authorized = await this.orgService.isUserProjectManager(projectId, req.user.id);
      if (!authorized) {
        throw new ForbiddenException('Seul un gestionnaire de projet peut initialiser l\'organisation');
      }
    }
    return this.orgService.initProjectOrganization(projectId);
  }
}
