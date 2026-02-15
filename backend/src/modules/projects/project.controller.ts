import {
  Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
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
  @ApiOperation({ summary: 'List all projects' })
  findAll() {
    return this.projectService.findAll();
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
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  // --- Members ---

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a team member to the project' })
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.projectService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a team member from the project' })
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectService.removeMember(id, userId);
  }

  // --- Partners ---

  @Post(':id/partners')
  @ApiOperation({ summary: 'Add a partner company' })
  addPartner(@Param('id') id: string, @Body() dto: AddPartnerDto) {
    return this.projectService.addPartner(id, dto);
  }

  @Delete(':id/partners/:partnerId')
  @ApiOperation({ summary: 'Remove a partner company' })
  removePartner(@Param('id') id: string, @Param('partnerId') partnerId: string) {
    return this.projectService.removePartner(partnerId);
  }

  // --- Vendors ---

  @Post(':id/vendors')
  @ApiOperation({ summary: 'Assign a vendor to the project' })
  assignVendor(@Param('id') id: string, @Body() dto: AssignVendorDto) {
    return this.projectService.assignVendor(id, dto);
  }

  @Delete(':id/vendors/:vendorId')
  @ApiOperation({ summary: 'Remove a vendor from the project' })
  removeVendor(@Param('id') id: string, @Param('vendorId') vendorId: string) {
    return this.projectService.removeVendor(id, vendorId);
  }
}
