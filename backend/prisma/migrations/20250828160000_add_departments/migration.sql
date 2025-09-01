-- CreateEnum
CREATE TYPE "Department" AS ENUM ('PMO', 'DESIGN', 'HTML', 'PHP', 'REACT', 'WORDPRESS', 'QA', 'DELIVERY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "department" "Department";

-- CreateTable
CREATE TABLE "project_department_history" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromDepartment" "Department",
    "toDepartment" "Department" NOT NULL,
    "movedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_department_history_pkey" PRIMARY KEY ("id")
);

-- AlterTable - Add currentDepartment with default, then update existing records
ALTER TABLE "projects" ADD COLUMN "currentDepartment" "Department" NOT NULL DEFAULT 'PMO';
ALTER TABLE "projects" ADD COLUMN "nextDepartment" "Department";

-- Update existing projects based on their targetStage
UPDATE "projects" SET "currentDepartment" = 'DESIGN' WHERE "targetStage" = 'Design';
UPDATE "projects" SET "currentDepartment" = 'QA' WHERE "targetStage" = 'Testing';
UPDATE "projects" SET "currentDepartment" = 'DELIVERY' WHERE "targetStage" = 'Accounts';
UPDATE "projects" SET "currentDepartment" = 'PMO' WHERE "targetStage" NOT IN ('Design', 'Testing', 'Accounts');

-- Drop the old targetStage column
ALTER TABLE "projects" DROP COLUMN "targetStage";

-- AddForeignKey
ALTER TABLE "project_department_history" ADD CONSTRAINT "project_department_history_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_department_history" ADD CONSTRAINT "project_department_history_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;