import { Controller, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DocumentProposalsService } from './document-proposals.service.js';
import { ReviewProposalDto } from './document-proposal.dto.js';

@ApiTags('Document Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/document-proposals')
export class DocumentProposalsController {
  constructor(private readonly service: DocumentProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'List document proposals for a project' })
  listByProject(
    @Query('projectId') projectId: string,
    @Query('status') status?: string,
  ) {
    return this.service.listByProject(projectId, status);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a document proposal and create/update register entry' })
  accept(
    @Param('id') id: string,
    @Body() dto: ReviewProposalDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.accept(id, req.user.id, dto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a document proposal' })
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewProposalDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.service.reject(id, req.user.id, dto);
  }
}
