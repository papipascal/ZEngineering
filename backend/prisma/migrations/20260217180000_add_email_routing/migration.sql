-- AlterTable: Add contactEmail to Vendor
ALTER TABLE "Vendor" ADD COLUMN "contactEmail" TEXT;

-- AlterTable: Add routing fields to IncomingEmail
ALTER TABLE "IncomingEmail" ADD COLUMN "assignedToId" TEXT;
ALTER TABLE "IncomingEmail" ADD COLUMN "routedVia" TEXT;
ALTER TABLE "IncomingEmail" ADD COLUMN "workflowInstanceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "IncomingEmail_workflowInstanceId_key" ON "IncomingEmail"("workflowInstanceId");

-- AddForeignKey
ALTER TABLE "IncomingEmail" ADD CONSTRAINT "IncomingEmail_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingEmail" ADD CONSTRAINT "IncomingEmail_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "WorkflowInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "EmailRouteTarget" AS ENUM ('PROJECT_MANAGER', 'DISCIPLINE_LEAD', 'PROCUREMENT', 'SPECIFIC_USER');

-- CreateTable
CREATE TABLE "EmailRoutingRule" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "senderDomain" TEXT,
    "senderEmail" TEXT,
    "subjectContains" TEXT,
    "isExternal" BOOLEAN,
    "target" "EmailRouteTarget" NOT NULL,
    "targetUserId" TEXT,
    "targetDiscipline" "Discipline",
    "autoPurpose" "EmailPurpose",
    "autoIntent" "EmailDocumentIntent",
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailRoutingRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailRoutingRule" ADD CONSTRAINT "EmailRoutingRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailRoutingRule" ADD CONSTRAINT "EmailRoutingRule_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
