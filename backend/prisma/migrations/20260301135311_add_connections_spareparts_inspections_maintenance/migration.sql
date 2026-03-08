-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('PROCESS_LINE', 'INSTRUMENT_LOOP', 'ELECTRICAL_CABLE', 'UTILITY_LINE', 'DRAIN_VENT');

-- CreateEnum
CREATE TYPE "SparePartCriticality" AS ENUM ('CRITICAL', 'IMPORTANT', 'STANDARD', 'CONSUMABLE');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('VISUAL', 'NDT_UT', 'NDT_RT', 'NDT_PT', 'NDT_MT', 'PRESSURE_TEST', 'FUNCTIONAL_TEST', 'FAT', 'SAT', 'PMI');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'PASS_WITH_REMARKS', 'FAIL', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "MaintenanceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'BIENNIAL', 'ON_CONDITION');

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "lineNumber" TEXT NOT NULL,
    "type" "ConnectionType" NOT NULL,
    "fluid" TEXT,
    "fromEquipmentId" TEXT,
    "toEquipmentId" TEXT,
    "fromNozzle" TEXT,
    "toNozzle" TEXT,
    "nominalDiameter" TEXT,
    "pressureClass" TEXT,
    "materialSpec" TEXT,
    "insulationType" TEXT,
    "paintSystem" TEXT,
    "isoCertRequired" BOOLEAN NOT NULL DEFAULT false,
    "lineListRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SparePart" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "manufacturer" TEXT,
    "supplierRef" TEXT,
    "criticality" "SparePartCriticality" NOT NULL DEFAULT 'STANDARD',
    "recommendedQty" INTEGER NOT NULL DEFAULT 1,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "leadTimeDays" INTEGER,
    "storageLocation" TEXT,
    "storageCondition" TEXT,
    "commissioningQty" INTEGER,
    "operationQty" INTEGER,
    "capitalSpareQty" INTEGER,
    "notes" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SparePart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionRecord" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" "InspectionType" NOT NULL,
    "result" "InspectionResult" NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "inspector" TEXT,
    "inspectorId" TEXT,
    "nextInspectionDate" TIMESTAMP(3),
    "certificate" TEXT,
    "description" TEXT,
    "remarks" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenancePlan" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "MaintenanceFrequency" NOT NULL,
    "estimatedDurationH" DOUBLE PRECISION,
    "requiredSkills" TEXT,
    "requiredTools" TEXT,
    "safetyNotes" TEXT,
    "lastPerformedAt" TIMESTAMP(3),
    "nextDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Connection_projectId_idx" ON "Connection"("projectId");

-- CreateIndex
CREATE INDEX "Connection_fromEquipmentId_idx" ON "Connection"("fromEquipmentId");

-- CreateIndex
CREATE INDEX "Connection_toEquipmentId_idx" ON "Connection"("toEquipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_projectId_lineNumber_key" ON "Connection"("projectId", "lineNumber");

-- CreateIndex
CREATE INDEX "SparePart_equipmentId_idx" ON "SparePart"("equipmentId");

-- CreateIndex
CREATE INDEX "SparePart_criticality_idx" ON "SparePart"("criticality");

-- CreateIndex
CREATE INDEX "InspectionRecord_equipmentId_idx" ON "InspectionRecord"("equipmentId");

-- CreateIndex
CREATE INDEX "InspectionRecord_inspectionDate_idx" ON "InspectionRecord"("inspectionDate");

-- CreateIndex
CREATE INDEX "MaintenancePlan_equipmentId_idx" ON "MaintenancePlan"("equipmentId");

-- CreateIndex
CREATE INDEX "MaintenancePlan_nextDueAt_idx" ON "MaintenancePlan"("nextDueAt");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_fromEquipmentId_fkey" FOREIGN KEY ("fromEquipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_toEquipmentId_fkey" FOREIGN KEY ("toEquipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparePart" ADD CONSTRAINT "SparePart_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SparePart" ADD CONSTRAINT "SparePart_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionRecord" ADD CONSTRAINT "InspectionRecord_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionRecord" ADD CONSTRAINT "InspectionRecord_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionRecord" ADD CONSTRAINT "InspectionRecord_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenancePlan" ADD CONSTRAINT "MaintenancePlan_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
