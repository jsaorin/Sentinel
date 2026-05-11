/*
  Warnings:

  - A unique constraint covering the columns `[address,multisig_id]` on the table `nonce_account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "nonce_account_address_key";

-- CreateIndex
CREATE UNIQUE INDEX "nonce_account_address_multisig_id_key" ON "nonce_account"("address", "multisig_id");
