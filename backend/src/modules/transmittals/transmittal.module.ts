import { Module } from '@nestjs/common';
import { TransmittalController } from './transmittal.controller.js';
import { TransmittalService } from './transmittal.service.js';

@Module({
  controllers: [TransmittalController],
  providers: [TransmittalService],
  exports: [TransmittalService],
})
export class TransmittalModule {}
