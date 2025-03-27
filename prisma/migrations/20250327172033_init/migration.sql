/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Alert` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Chamado` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Construtora` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Empreendimento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Financeiro` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Logs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Solicitacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Suporte` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `relatorio_financeiro` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Alert_id_key" ON "Alert"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Chamado_id_key" ON "Chamado"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Construtora_id_key" ON "Construtora"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Empreendimento_id_key" ON "Empreendimento"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Financeiro_id_key" ON "Financeiro"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Logs_id_key" ON "Logs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitacao_id_key" ON "Solicitacao"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Suporte_id_key" ON "Suporte"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_financeiro_id_key" ON "relatorio_financeiro"("id");
