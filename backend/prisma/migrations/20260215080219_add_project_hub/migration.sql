-- CreateEnum
CREATE TYPE "DocRegisterStatus" AS ENUM ('DRAFT', 'FOR_REVIEW', 'FOR_APPROVAL', 'APPROVED', 'SUPERSEDED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "registerEntryId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "clientContact" TEXT,
ADD COLUMN     "clientName" TEXT;

-- CreateTable
CREATE TABLE "ProjectPartner" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVendor" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRegisterEntry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "issuerId" TEXT,
    "revision" TEXT NOT NULL DEFAULT 'A',
    "status" "DocRegisterStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRegisterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVendor_projectId_vendorId_key" ON "ProjectVendor"("projectId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRegisterEntry_projectId_documentNumber_key" ON "DocumentRegisterEntry"("projectId", "documentNumber");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_registerEntryId_fkey" FOREIGN KEY ("registerEntryId") REFERENCES "DocumentRegisterEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPartner" ADD CONSTRAINT "ProjectPartner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVendor" ADD CONSTRAINT "ProjectVendor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVendor" ADD CONSTRAINT "ProjectVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRegisterEntry" ADD CONSTRAINT "DocumentRegisterEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRegisterEntry" ADD CONSTRAINT "DocumentRegisterEntry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRegisterEntry" ADD CONSTRAINT "DocumentRegisterEntry_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
