-- CreateTable
CREATE TABLE "DataOrigin" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldValue" TEXT NOT NULL,
    "sourceEntryId" TEXT,
    "sourceDocumentId" TEXT,
    "sourceRef" TEXT,
    "sourceRevision" TEXT,
    "sourceIssueDate" TIMESTAMP(3),
    "sourcePage" TEXT,
    "validatedById" TEXT NOT NULL,
    "validatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataOrigin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataOrigin_equipmentId_fieldName_idx" ON "DataOrigin"("equipmentId", "fieldName");

-- AddForeignKey
ALTER TABLE "DataOrigin" ADD CONSTRAINT "DataOrigin_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataOrigin" ADD CONSTRAINT "DataOrigin_sourceEntryId_fkey" FOREIGN KEY ("sourceEntryId") REFERENCES "DocumentRegisterEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataOrigin" ADD CONSTRAINT "DataOrigin_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataOrigin" ADD CONSTRAINT "DataOrigin_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
