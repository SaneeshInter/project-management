-- CreateEnum
CREATE TYPE "DepartmentWorkStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'CORRECTIONS_NEEDED', 'COMPLETED', 'ON_HOLD');
CREATE TYPE "CorrectionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "project_department_history" 
ADD COLUMN "workStatus" "DepartmentWorkStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN "workStartDate" TIMESTAMP(3),
ADD COLUMN "workEndDate" TIMESTAMP(3),
ADD COLUMN "estimatedDays" INTEGER,
ADD COLUMN "actualDays" INTEGER,
ADD COLUMN "correctionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "permissionGrantedById" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "department_corrections" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "correctionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,

    CONSTRAINT "department_corrections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_department_history" ADD CONSTRAINT "project_department_history_permissionGrantedById_fkey" FOREIGN KEY ("permissionGrantedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_corrections" ADD CONSTRAINT "department_corrections_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "project_department_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_corrections" ADD CONSTRAINT "department_corrections_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_corrections" ADD CONSTRAINT "department_corrections_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;