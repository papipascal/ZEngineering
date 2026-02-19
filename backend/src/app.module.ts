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
import { ProjectModule } from './modules/projects/project.module.js';
import { DocumentRegisterModule } from './modules/document-register/document-register.module.js';
import { TransmittalModule } from './modules/transmittals/transmittal.module.js';
import { IncomingEmailModule } from './modules/incoming-emails/incoming-email.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { ContractItemsModule } from './modules/contract-items/contract-items.module.js';
import { DataOriginModule } from './modules/data-origin/data-origin.module.js';
import { OrganizationModule } from './modules/organization/organization.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { NotificationModule } from './modules/notifications/notification.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { ExportModule } from './modules/export/export.module.js';
import { DocumentProposalsModule } from './modules/document-proposals/document-proposals.module.js';
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
    ProjectModule,
    DocumentRegisterModule,
    TransmittalModule,
    IncomingEmailModule,
    SearchModule,
    ContractItemsModule,
    DataOriginModule,
    OrganizationModule,
    NotificationModule,
    DashboardModule,
    AuditModule,
    ExportModule,
    DocumentProposalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
