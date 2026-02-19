import { Module } from '@nestjs/common';
import { DocumentProposalsController } from './document-proposals.controller.js';
import { DocumentProposalsService } from './document-proposals.service.js';

@Module({
  controllers: [DocumentProposalsController],
  providers: [DocumentProposalsService],
  exports: [DocumentProposalsService],
})
export class DocumentProposalsModule {}
