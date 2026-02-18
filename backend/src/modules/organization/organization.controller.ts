import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
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
  @ApiOperation({ summary: 'Update project organization (Doc Controller)' })
  updateProjectOrg(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateOrgDto,
  ) {
    return this.orgService.updateProjectOrg(projectId, dto);
  }

  @Get('project/:projectId/tree')
  @ApiOperation({ summary: 'Get project tree structure' })
  getProjectTree(@Param('projectId') projectId: string) {
    return this.orgService.getProjectTree(projectId);
  }

  @Put('project/:projectId/tree')
  @ApiOperation({ summary: 'Update project tree structure (Doc Controller)' })
  updateProjectTree(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateTreeDto,
  ) {
    return this.orgService.updateProjectTree(projectId, dto);
  }

  @Post('project/:projectId/init')
  @ApiOperation({ summary: 'Initialize project organization and tree from defaults' })
  initProject(@Param('projectId') projectId: string) {
    return this.orgService.initProjectOrganization(projectId);
  }
}
