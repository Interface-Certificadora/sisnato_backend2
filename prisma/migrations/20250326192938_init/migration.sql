-- DropForeignKey
ALTER TABLE "SolicitacaoRelacionamento" DROP CONSTRAINT "SolicitacaoRelacionamento_solicitacaoId_fkey";

-- AddForeignKey
ALTER TABLE "SolicitacaoRelacionamento" ADD CONSTRAINT "SolicitacaoRelacionamento_relacionadaCpf_fkey" FOREIGN KEY ("relacionadaCpf") REFERENCES "Solicitacao"("cpf") ON DELETE CASCADE ON UPDATE CASCADE;
