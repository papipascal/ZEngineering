import { Module } from '@nestjs/common';
import { IncomingEmailController } from './incoming-email.controller.js';
import { IncomingEmailService } from './incoming-email.service.js';
import { ImapPollingService } from './imap-polling.service.js';

@Module({
  controllers: [IncomingEmailController],
  providers: [IncomingEmailService, ImapPollingService],
  exports: [IncomingEmailService],
})
export class IncomingEmailModule {}
