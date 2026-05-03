-- AlterTable
ALTER TABLE "proposal" ADD COLUMN     "approvers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "cancellers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rejecters" TEXT[] DEFAULT ARRAY[]::TEXT[];
