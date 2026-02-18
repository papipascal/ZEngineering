import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { IncomingEmailService } from './incoming-email.service.js';
import { IncomingEmailFilterDto } from './dto/incoming-email-filter.dto.js';
import { UpdateIncomingEmailDto } from './dto/update-incoming-email.dto.js';

@ApiTags('Incoming Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/incoming-emails')
export class IncomingEmailController {
  constructor(private readonly service: IncomingEmailService) {}

  @Get('status')
  getImapStatus() {
    const configured = !!process.env.IMAP_HOST;
    return {
      configured,
      host: configured ? process.env.IMAP_HOST : undefined,
      polling: configured,
    };
  }

  @Get()
  findAll(@Query() filter: IncomingEmailFilterDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncomingEmailDto) {
    return this.service.update(id, dto);
  }
}
