-- AlterTable
ALTER TABLE "IncomingEmail" ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "classifiedDiscipline" "Discipline",
ADD COLUMN     "classifiedTreeNodeId" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "docNumberPattern" TEXT;

-- CreateTable
CREATE TABLE "EmailSenderWhitelist" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "emailOrDomain" TEXT NOT NULL,
    "label" TEXT,
    "addedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSenderWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentProposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "incomingEmailId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "proposedDocNumber" TEXT,
    "proposedTitle" TEXT,
    "proposedDiscipline" "Discipline",
    "proposedTreeNodeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSenderWhitelist_projectId_emailOrDomain_key" ON "EmailSenderWhitelist"("projectId", "emailOrDomain");

-- AddForeignKey
ALTER TABLE "EmailSenderWhitelist" ADD CONSTRAINT "EmailSenderWhitelist_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSenderWhitelist" ADD CONSTRAINT "EmailSenderWhitelist_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentProposal" ADD CONSTRAINT "DocumentProposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentProposal" ADD CONSTRAINT "DocumentProposal_incomingEmailId_fkey" FOREIGN KEY ("incomingEmailId") REFERENCES "IncomingEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentProposal" ADD CONSTRAINT "DocumentProposal_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentProposal" ADD CONSTRAINT "DocumentProposal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
