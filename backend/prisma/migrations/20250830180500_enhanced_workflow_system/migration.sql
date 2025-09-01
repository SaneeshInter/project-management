-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('CLIENT_APPROVAL', 'QA_APPROVAL', 'BEFORE_LIVE_QA');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QAType" AS ENUM ('HTML_QA', 'DEV_QA', 'BEFORE_LIVE_QA');

-- CreateEnum
CREATE TYPE "QAStatus" AS ENUM ('IN_PROGRESS', 'PASSED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BugSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'FIXED', 'VERIFIED', 'CLOSED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'PENDING_CLIENT_APPROVAL';
ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'CLIENT_REJECTED';
ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'QA_TESTING';
ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'QA_REJECTED';
ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'BUGFIX_IN_PROGRESS';
ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'BEFORE_LIVE_QA';
ALTER TYPE "DepartmentWorkStatus" ADD VALUE 'READY_FOR_DELIVERY';

-- CreateTable
CREATE TABLE "workflow_approvals" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "approvalType" "ApprovalType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "comments" TEXT,
    "rejectionReason" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "workflow_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_testing_rounds" (
    "id" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "qaType" "QAType" NOT NULL,
    "status" "QAStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "testedById" TEXT NOT NULL,
    "bugsFound" INTEGER NOT NULL DEFAULT 0,
    "criticalBugs" INTEGER NOT NULL DEFAULT 0,
    "testResults" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "qa_testing_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_bugs" (
    "id" TEXT NOT NULL,
    "qaRoundId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "BugSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "BugStatus" NOT NULL DEFAULT 'OPEN',
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fixedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "screenshot" TEXT,
    "steps" TEXT,

    CONSTRAINT "qa_bugs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workflow_approvals" ADD CONSTRAINT "workflow_approvals_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "project_department_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_approvals" ADD CONSTRAINT "workflow_approvals_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_approvals" ADD CONSTRAINT "workflow_approvals_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_testing_rounds" ADD CONSTRAINT "qa_testing_rounds_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "project_department_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_testing_rounds" ADD CONSTRAINT "qa_testing_rounds_testedById_fkey" FOREIGN KEY ("testedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_bugs" ADD CONSTRAINT "qa_bugs_qaRoundId_fkey" FOREIGN KEY ("qaRoundId") REFERENCES "qa_testing_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_bugs" ADD CONSTRAINT "qa_bugs_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
