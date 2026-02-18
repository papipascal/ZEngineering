import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { AddPartnerDto } from './dto/add-partner.dto.js';
import { AssignVendorDto } from './dto/assign-vendor.dto.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      orderBy: { name: 'asc' },
      include: {
        members: { where: { userId }, select: { role: true } },
        _count: { select: { members: true, equipment: true, discussions: true, documents: true } },
      },
    });
    return projects.map(({ members, ...project }) => ({
      ...project,
      myRole: members[0]?.role ?? 'member',
    }));
  }

  async findOne(id: string, userId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true, discipline: true } } },
          orderBy: { role: 'asc' },
        },
        partners: { orderBy: { name: 'asc' } },
        projectVendors: {
          include: {
            vendor: {
              include: { specialties: { select: { equipmentType: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { equipment: true, discussions: true, documents: true, workflows: true, documentEntries: true },
        },
      },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);

    const myRole = userId
      ? project.members.find((m) => m.userId === userId)?.role ?? 'member'
      : undefined;

    return { ...project, myRole };
  }

  async create(dto: CreateProjectDto, ownerId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        members: { create: { userId: ownerId, role: 'owner' } },
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  // --- Members ---

  async addMember(projectId: string, dto: AddMemberDto) {
    await this.findOne(projectId);
    try {
      return await this.prisma.projectMember.create({
        data: { projectId, userId: dto.userId, role: dto.role ?? 'member' },
        include: { user: { select: { id: true, name: true, email: true, discipline: true } } },
      });
    } catch {
      throw new ConflictException('User is already a member of this project');
    }
  }

  async removeMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return this.prisma.projectMember.delete({ where: { id: member.id } });
  }

  // --- Partners ---

  async addPartner(projectId: string, dto: AddPartnerDto) {
    await this.findOne(projectId);
    return this.prisma.projectPartner.create({
      data: { projectId, ...dto },
    });
  }

  async removePartner(partnerId: string) {
    const partner = await this.prisma.projectPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    return this.prisma.projectPartner.delete({ where: { id: partnerId } });
  }

  // --- Vendors ---

  async assignVendor(projectId: string, dto: AssignVendorDto) {
    await this.findOne(projectId);
    try {
      return await this.prisma.projectVendor.create({
        data: { projectId, vendorId: dto.vendorId, notes: dto.notes },
        include: { vendor: { select: { id: true, name: true, country: true } } },
      });
    } catch {
      throw new ConflictException('Vendor is already assigned to this project');
    }
  }

  async removeVendor(projectId: string, vendorId: string) {
    const pv = await this.prisma.projectVendor.findUnique({
      where: { projectId_vendorId: { projectId, vendorId } },
    });
    if (!pv) throw new NotFoundException('Vendor assignment not found');
    return this.prisma.projectVendor.delete({ where: { id: pv.id } });
  }
}
