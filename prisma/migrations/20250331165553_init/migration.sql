/*
  Warnings:

  - You are about to drop the column `financeiroId` on the `Construtora` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Construtora" DROP CONSTRAINT "Construtora_financeiroId_fkey";

-- AlterTable
ALTER TABLE "Construtora" DROP COLUMN "financeiroId";

-- CreateTable
CREATE TABLE "FinanceiroConstrutora" (
    "financeiroId" INTEGER NOT NULL,
    "construtoraId" INTEGER NOT NULL,

    CONSTRAINT "FinanceiroConstrutora_pkey" PRIMARY KEY ("construtoraId","financeiroId")
);

-- AddForeignKey
ALTER TABLE "FinanceiroConstrutora" ADD CONSTRAINT "FinanceiroConstrutora_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceiroConstrutora" ADD CONSTRAINT "FinanceiroConstrutora_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
