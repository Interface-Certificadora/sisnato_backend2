-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_idResposta_fkey" FOREIGN KEY ("idResposta") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE SET NULL;
