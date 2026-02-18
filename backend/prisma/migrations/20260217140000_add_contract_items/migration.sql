-- CreateEnum
CREATE TYPE "ContractItemType" AS ENUM ('REQUIREMENT', 'CHANGE');
CREATE TYPE "ContractItemStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED', 'COMPLIANT', 'NON_COMPLIANT', 'WAIVED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ON_HOLD');
CREATE TYPE "ContractItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ContractImpact" AS ENUM ('NONE', 'MINOR', 'MODERATE', 'MAJOR');

-- CreateTable
CREATE TABLE "ContractItem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ContractItemType" NOT NULL,
    "itemNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "clauseRef" TEXT,
    "specTitle" TEXT,
    "docRef" TEXT,
    "docRevision" TEXT,
    "docPage" TEXT,
    "status" "ContractItemStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "ContractItemPriority" NOT NULL DEFAULT 'MEDIUM',
    "discipline" "Discipline",
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT,
    "reqCategory" TEXT,
    "reqAction" TEXT,
    "consequence" TEXT,
    "scopeLimit" TEXT,
    "changeRequestedBy" TEXT,
    "changeDate" TIMESTAMP(3),
    "commercialImpact" "ContractImpact" NOT NULL DEFAULT 'NONE',
    "commercialValue" DOUBLE PRECISION,
    "scheduleImpact" "ContractImpact" NOT NULL DEFAULT 'NONE',
    "scheduleDays" INTEGER,
    "technicalImpact" TEXT,
    "clientRef" TEXT,
    "deviationType" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractItem_projectId_type_idx" ON "ContractItem"("projectId", "type");
CREATE UNIQUE INDEX "ContractItem_projectId_itemNumber_key" ON "ContractItem"("projectId", "itemNumber");

-- AddForeignKey
ALTER TABLE "ContractItem" ADD CONSTRAINT "ContractItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractItem" ADD CONSTRAINT "ContractItem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContractItem" ADD CONSTRAINT "ContractItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
