import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { IncomingEmailService } from './incoming-email.service.js';
import { EmailWhitelistService } from './email-whitelist.service.js';
import { IncomingEmailFilterDto } from './dto/incoming-email-filter.dto.js';
import { UpdateIncomingEmailDto } from './dto/update-incoming-email.dto.js';
import { CreateRoutingRuleDto, UpdateRoutingRuleDto } from './dto/create-routing-rule.dto.js';
import { ReplyEmailDto } from './dto/reply-email.dto.js';

@ApiTags('Incoming Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/incoming-emails')
export class IncomingEmailController {
  constructor(
    private readonly service: IncomingEmailService,
    private readonly whitelistService: EmailWhitelistService,
  ) {}

  // ==========================================
  // IMAP Status
  // ==========================================

  @Get('status')
  @ApiOperation({ summary: 'Check IMAP polling configuration status' })
  getImapStatus() {
    const configured = !!process.env.IMAP_HOST;
    return {
      configured,
      host: configured ? process.env.IMAP_HOST : undefined,
      polling: configured,
    };
  }

  // ==========================================
  // Emails
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'List incoming emails with filters' })
  findAll(@Query() filter: IncomingEmailFilterDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incoming email details with attachments' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update email status, purpose, document intent, or notes' })
  update(@Param('id') id: string, @Body() dto: UpdateIncomingEmailDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to an incoming email' })
  reply(@Param('id') id: string, @Body() dto: ReplyEmailDto) {
    return this.service.replyToEmail(id, dto);
  }

  // ==========================================
  // Routing Rules
  // ==========================================

  @Get('rules/project/:projectId')
  @ApiOperation({ summary: 'List email routing rules for a project' })
  listRules(@Param('projectId') projectId: string) {
    return this.service.listRules(projectId);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create an email routing rule' })
  createRule(@Body() dto: CreateRoutingRuleDto) {
    return this.service.createRule(dto);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update an email routing rule' })
  updateRule(@Param('id') id: string, @Body() dto: UpdateRoutingRuleDto) {
    return this.service.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete an email routing rule' })
  deleteRule(@Param('id') id: string) {
    return this.service.deleteRule(id);
  }

  // ==========================================
  // Sender Whitelist
  // ==========================================

  @Get('whitelist')
  @ApiOperation({ summary: 'List authorized external senders for a project' })
  listWhitelist(@Query('projectId') projectId: string) {
    return this.whitelistService.listWhitelist(projectId);
  }

  @Post('whitelist')
  @ApiOperation({ summary: 'Add email or domain to project sender whitelist' })
  addToWhitelist(
    @Body() body: { projectId: string; emailOrDomain: string; label?: string },
    @Request() req: { user: { id: string } },
  ) {
    return this.whitelistService.addToWhitelist({
      projectId: body.projectId,
      emailOrDomain: body.emailOrDomain.toLowerCase().trim(),
      label: body.label,
      addedByUserId: req.user.id,
    });
  }

  @Delete('whitelist/:id')
  @ApiOperation({ summary: 'Remove entry from sender whitelist' })
  removeFromWhitelist(@Param('id') id: string) {
    return this.whitelistService.removeFromWhitelist(id);
  }
}
