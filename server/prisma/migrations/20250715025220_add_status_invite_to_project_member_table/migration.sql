-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "project_members" ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';
