/*
  Warnings:

  - Added the required column `transaction_pda` to the `proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proposal" ADD COLUMN     "transaction_pda" TEXT NOT NULL;
