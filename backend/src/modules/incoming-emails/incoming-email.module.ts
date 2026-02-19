import { Module } from '@nestjs/common';
import { IncomingEmailController } from './incoming-email.controller.js';
import { IncomingEmailService } from './incoming-email.service.js';
import { ImapPollingService } from './imap-polling.service.js';
import { EmailRouterService } from './email-router.service.js';
import { EmailWhitelistService } from './email-whitelist.service.js';
import { EmailClassificationService } from './email-classification.service.js';
import { WorkflowModule } from '../workflows/workflow.module.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [WorkflowModule, MailModule],
  controllers: [IncomingEmailController],
  providers: [
    IncomingEmailService,
    ImapPollingService,
    EmailRouterService,
    EmailWhitelistService,
    EmailClassificationService,
  ],
  exports: [IncomingEmailService, EmailWhitelistService],
})
export class IncomingEmailModule {}
