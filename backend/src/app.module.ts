import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { MailModule } from './modules/mail/mail.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { WorkflowModule } from './modules/workflows/workflow.module.js';
import { EquipmentModule } from './modules/equipment/equipment.module.js';
import { DiscussionModule } from './modules/discussions/discussion.module.js';
import { ChangeRequestModule } from './modules/change-requests/change-request.module.js';
import { DocumentModule } from './modules/documents/document.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    MailModule,
    AuthModule,
    WorkflowModule,
    EquipmentModule,
    DiscussionModule,
    ChangeRequestModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
