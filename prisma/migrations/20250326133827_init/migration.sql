/*
  Warnings:

  - You are about to drop the column `construtoraId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `empreendimentoId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `financeiroId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_construtoraId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_empreendimentoId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_financeiroId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "construtoraId",
DROP COLUMN "empreendimentoId",
DROP COLUMN "financeiroId";

-- CreateTable
CREATE TABLE "UserEmpreendimento" (
    "userId" INTEGER NOT NULL,
    "empreendimentoId" INTEGER NOT NULL,

    CONSTRAINT "UserEmpreendimento_pkey" PRIMARY KEY ("userId","empreendimentoId")
);

-- CreateTable
CREATE TABLE "UserConstrutora" (
    "userId" INTEGER NOT NULL,
    "construtoraId" INTEGER NOT NULL,

    CONSTRAINT "UserConstrutora_pkey" PRIMARY KEY ("userId","construtoraId")
);

-- CreateTable
CREATE TABLE "UserFinanceiro" (
    "userId" INTEGER NOT NULL,
    "financeiroId" INTEGER NOT NULL,

    CONSTRAINT "UserFinanceiro_pkey" PRIMARY KEY ("userId","financeiroId")
);

-- AddForeignKey
ALTER TABLE "UserEmpreendimento" ADD CONSTRAINT "UserEmpreendimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmpreendimento" ADD CONSTRAINT "UserEmpreendimento_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConstrutora" ADD CONSTRAINT "UserConstrutora_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConstrutora" ADD CONSTRAINT "UserConstrutora_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFinanceiro" ADD CONSTRAINT "UserFinanceiro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFinanceiro" ADD CONSTRAINT "UserFinanceiro_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
