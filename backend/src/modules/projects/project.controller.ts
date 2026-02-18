import {
  Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProjectRoleGuard } from '../auth/project-role.guard.js';
import { ProjectRoles } from '../auth/project-roles.decorator.js';
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { AddPartnerDto } from './dto/add-partner.dto.js';
import { AssignVendorDto } from './dto/assign-vendor.dto.js';

@ApiTags('Projects')
@Controller('api/projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'List projects for current user (with role)' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.projectService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body() dto: CreateProjectDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.projectService.create(dto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with members, partners, vendors' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.projectService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Update project details (managers only)' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  // --- Members ---

  @Post(':id/members')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Add a team member (managers only)' })
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.projectService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Remove a team member (managers only)' })
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectService.removeMember(id, userId);
  }

  // --- Partners ---

  @Post(':id/partners')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Add a partner company (managers only)' })
  addPartner(@Param('id') id: string, @Body() dto: AddPartnerDto) {
    return this.projectService.addPartner(id, dto);
  }

  @Delete(':id/partners/:partnerId')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Remove a partner company (managers only)' })
  removePartner(@Param('id') id: string, @Param('partnerId') partnerId: string) {
    return this.projectService.removePartner(partnerId);
  }

  // --- Vendors ---

  @Post(':id/vendors')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Assign a vendor (managers only)' })
  assignVendor(@Param('id') id: string, @Body() dto: AssignVendorDto) {
    return this.projectService.assignVendor(id, dto);
  }

  @Delete(':id/vendors/:vendorId')
  @UseGuards(ProjectRoleGuard)
  @ProjectRoles('owner', 'manager')
  @ApiOperation({ summary: 'Remove a vendor (managers only)' })
  removeVendor(@Param('id') id: string, @Param('vendorId') vendorId: string) {
    return this.projectService.removeVendor(id, vendorId);
  }
}
