/*
  Warnings:

  - The primary key for the `SolicitacaoRelacionamento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `relacionadaCpf` on the `SolicitacaoRelacionamento` table. All the data in the column will be lost.
  - Added the required column `relacionadaId` to the `SolicitacaoRelacionamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SolicitacaoRelacionamento" DROP CONSTRAINT "SolicitacaoRelacionamento_relacionadaCpf_fkey";

-- DropIndex
DROP INDEX "Solicitacao_cpf_key";

-- DropIndex
DROP INDEX "idx_solicitacao_cpf";

-- AlterTable
ALTER TABLE "SolicitacaoRelacionamento" DROP CONSTRAINT "SolicitacaoRelacionamento_pkey",
DROP COLUMN "relacionadaCpf",
ADD COLUMN     "relacionadaId" INTEGER NOT NULL,
ADD CONSTRAINT "SolicitacaoRelacionamento_pkey" PRIMARY KEY ("solicitacaoId", "relacionadaId");

-- AddForeignKey
ALTER TABLE "SolicitacaoRelacionamento" ADD CONSTRAINT "SolicitacaoRelacionamento_relacionadaId_fkey" FOREIGN KEY ("relacionadaId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
