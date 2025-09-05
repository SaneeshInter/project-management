-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disabledAt" TIMESTAMP(3),
ADD COLUMN     "disabledBy" TEXT;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_disabledBy_fkey" FOREIGN KEY ("disabledBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;