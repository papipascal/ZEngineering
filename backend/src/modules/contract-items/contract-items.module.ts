import { Module } from '@nestjs/common';
import { ContractItemsController } from './contract-items.controller.js';
import { ContractItemsService } from './contract-items.service.js';

@Module({
  controllers: [ContractItemsController],
  providers: [ContractItemsService],
  exports: [ContractItemsService],
})
export class ContractItemsModule {}
