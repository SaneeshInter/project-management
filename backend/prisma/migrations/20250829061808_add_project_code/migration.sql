-- AlterTable
ALTER TABLE "project_department_history" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "projectCode" TEXT NOT NULL DEFAULT '';
