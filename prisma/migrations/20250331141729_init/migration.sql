/*
  Warnings:

  - You are about to drop the column `atividade` on the `Construtora` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Construtora` table. All the data in the column will be lost.
  - You are about to drop the column `vendedores` on the `Empreendimento` table. All the data in the column will be lost.
  - You are about to drop the column `autorId` on the `Financeiro` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Financeiro` table. All the data in the column will be lost.
  - You are about to drop the column `empreendimentoId` on the `Financeiro` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Financeiro` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Financeiro` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Financeiro" DROP CONSTRAINT "Financeiro_autorId_fkey";

-- DropForeignKey
ALTER TABLE "Financeiro" DROP CONSTRAINT "Financeiro_empreendimentoId_fkey";

-- AlterTable
ALTER TABLE "Construtora" DROP COLUMN "atividade",
DROP COLUMN "tipo";

-- AlterTable
ALTER TABLE "Empreendimento" DROP COLUMN "vendedores";

-- AlterTable
ALTER TABLE "Financeiro" DROP COLUMN "autorId",
DROP COLUMN "content",
DROP COLUMN "empreendimentoId",
DROP COLUMN "tipo",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "FinanceiroEmpreendimento" (
    "financeiroId" INTEGER NOT NULL,
    "empreendimentoId" INTEGER NOT NULL,

    CONSTRAINT "FinanceiroEmpreendimento_pkey" PRIMARY KEY ("empreendimentoId","financeiroId")
);

-- AddForeignKey
ALTER TABLE "FinanceiroEmpreendimento" ADD CONSTRAINT "FinanceiroEmpreendimento_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceiroEmpreendimento" ADD CONSTRAINT "FinanceiroEmpreendimento_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
