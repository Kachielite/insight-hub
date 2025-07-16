/*
  Warnings:

  - You are about to drop the column `status` on the `tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "status",
ALTER COLUMN "project_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "TokenStatus";
