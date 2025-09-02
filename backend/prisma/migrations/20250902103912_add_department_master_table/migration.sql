-- CreateTable
CREATE TABLE "department_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_master_name_key" ON "department_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "department_master_code_key" ON "department_master"("code");

-- AddForeignKey
ALTER TABLE "department_master" ADD CONSTRAINT "department_master_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "department_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
