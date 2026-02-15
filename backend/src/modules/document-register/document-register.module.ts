import { Module } from '@nestjs/common';
import { DocumentRegisterController } from './document-register.controller.js';
import { DocumentRegisterService } from './document-register.service.js';

@Module({
  controllers: [DocumentRegisterController],
  providers: [DocumentRegisterService],
  exports: [DocumentRegisterService],
})
export class DocumentRegisterModule {}
