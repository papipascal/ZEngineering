import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { IncomingEmailService } from './incoming-email.service.js';
import { IncomingEmailFilterDto } from './dto/incoming-email-filter.dto.js';
import { UpdateIncomingEmailDto } from './dto/update-incoming-email.dto.js';
import { CreateRoutingRuleDto, UpdateRoutingRuleDto } from './dto/create-routing-rule.dto.js';
import { ReplyEmailDto } from './dto/reply-email.dto.js';

@ApiTags('Incoming Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/incoming-emails')
export class IncomingEmailController {
  constructor(private readonly service: IncomingEmailService) {}

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
}
