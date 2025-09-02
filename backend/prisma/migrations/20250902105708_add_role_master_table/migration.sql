-- CreateTable
CREATE TABLE "role_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_master_name_key" ON "role_master"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_master_code_key" ON "role_master"("code");

-- AddForeignKey
ALTER TABLE "role_master" ADD CONSTRAINT "role_master_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
