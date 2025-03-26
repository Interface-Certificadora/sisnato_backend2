/*
  Warnings:

  - You are about to drop the column `relacionamento` on the `Solicitacao` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Solicitacao` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Solicitacao" DROP COLUMN "relacionamento";

-- CreateTable
CREATE TABLE "SolicitacaoRelacionamento" (
    "solicitacaoId" INTEGER NOT NULL,
    "relacionadaCpf" TEXT NOT NULL,

    CONSTRAINT "SolicitacaoRelacionamento_pkey" PRIMARY KEY ("solicitacaoId","relacionadaCpf")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solicitacao_cpf_key" ON "Solicitacao"("cpf");

-- AddForeignKey
ALTER TABLE "SolicitacaoRelacionamento" ADD CONSTRAINT "SolicitacaoRelacionamento_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
