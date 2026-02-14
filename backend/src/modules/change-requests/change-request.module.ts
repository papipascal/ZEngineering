import { Module } from '@nestjs/common';
import { ChangeRequestController } from './change-request.controller.js';
import { ChangeRequestService } from './change-request.service.js';

@Module({
  controllers: [ChangeRequestController],
  providers: [ChangeRequestService],
  exports: [ChangeRequestService],
})
export class ChangeRequestModule {}
