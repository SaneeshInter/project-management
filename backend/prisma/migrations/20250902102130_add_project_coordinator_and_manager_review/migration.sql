-- AlterEnum
ALTER TYPE "ApprovalType" ADD VALUE 'MANAGER_REVIEW';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PROJECT_COORDINATOR';
ALTER TYPE "Role" ADD VALUE 'HTML_DEVELOPER';
ALTER TYPE "Role" ADD VALUE 'QA_TESTER';
