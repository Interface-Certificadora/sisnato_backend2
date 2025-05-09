/*
  Warnings:

  - You are about to drop the column `email` on the `Empreendimento` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Empreendimento` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Empreendimento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Construtora" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Empreendimento" DROP COLUMN "email",
DROP COLUMN "telefone",
DROP COLUMN "tipo";

-- AlterTable
ALTER TABLE "Financeiro" ALTER COLUMN "updatedAt" DROP NOT NULL;
