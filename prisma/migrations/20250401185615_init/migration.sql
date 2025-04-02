/*
  Warnings:

  - You are about to drop the `_ChamadoToSolicitacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChamadoToSolicitacao" DROP CONSTRAINT "_ChamadoToSolicitacao_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChamadoToSolicitacao" DROP CONSTRAINT "_ChamadoToSolicitacao_B_fkey";

-- AlterTable
ALTER TABLE "Chamado" ADD COLUMN     "solicitacaoId" INTEGER;

-- DropTable
DROP TABLE "_ChamadoToSolicitacao";

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Solicitacao"("id") ON DELETE NO ACTION ON UPDATE SET NULL;
