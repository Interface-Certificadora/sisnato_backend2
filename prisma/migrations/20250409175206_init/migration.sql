/*
  Warnings:

  - The primary key for the `UserEmpreendimento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserEmpreendimento` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserEmpreendimento_id_key";

-- AlterTable
ALTER TABLE "UserEmpreendimento" DROP CONSTRAINT "UserEmpreendimento_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserEmpreendimento_pkey" PRIMARY KEY ("userId", "empreendimentoId");
