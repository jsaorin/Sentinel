-- CreateEnum
CREATE TYPE "AffectedEntityRole" AS ENUM ('attacker', 'victim', 'compromised', 'vulnerable', 'unknown');

-- AlterTable
ALTER TABLE "threat_signal_entities" ADD COLUMN     "role" "AffectedEntityRole";
