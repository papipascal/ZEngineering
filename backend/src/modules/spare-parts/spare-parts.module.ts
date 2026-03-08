import { Module } from '@nestjs/common';
import { SparePartsController } from './spare-parts.controller.js';
import { SparePartsService } from './spare-parts.service.js';

@Module({
  controllers: [SparePartsController],
  providers: [SparePartsService],
  exports: [SparePartsService],
})
export class SparePartsModule {}
