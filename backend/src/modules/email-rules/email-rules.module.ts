import { Module } from '@nestjs/common';
import { EmailRulesController } from './email-rules.controller.js';
import { EmailRulesService } from './email-rules.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [EmailRulesController],
  providers: [EmailRulesService],
})
export class EmailRulesModule {}
