/*
  Warnings:

  - You are about to drop the column `chave` on the `Empreendimento` table. All the data in the column will be lost.
  - You are about to drop the column `dt_fim` on the `Empreendimento` table. All the data in the column will be lost.
  - You are about to drop the column `dt_inicio` on the `Empreendimento` table. All the data in the column will be lost.
  - You are about to drop the column `valor_cert` on the `Empreendimento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Empreendimento" DROP COLUMN "chave",
DROP COLUMN "dt_fim",
DROP COLUMN "dt_inicio",
DROP COLUMN "valor_cert",
ALTER COLUMN "updatedAt" DROP NOT NULL;
