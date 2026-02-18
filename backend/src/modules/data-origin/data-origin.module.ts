import { Module } from '@nestjs/common';
import { DataOriginService } from './data-origin.service.js';
import { DataOriginController } from './data-origin.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [DataOriginController],
  providers: [DataOriginService],
  exports: [DataOriginService],
})
export class DataOriginModule {}
