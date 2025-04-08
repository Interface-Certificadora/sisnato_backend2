/*
  Warnings:

  - You are about to drop the `SolicitacaoRelacionamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SolicitacaoRelacionamento" DROP CONSTRAINT "SolicitacaoRelacionamento_relacionadaId_fkey";

-- AlterTable
ALTER TABLE "Solicitacao" ADD COLUMN     "relacionamentos" JSONB[];

-- DropTable
DROP TABLE "SolicitacaoRelacionamento";
