/*
  Warnings:

  - The primary key for the `UserEmpreendimento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `UserEmpreendimento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserEmpreendimento" DROP CONSTRAINT "UserEmpreendimento_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserEmpreendimento_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmpreendimento_id_key" ON "UserEmpreendimento"("id");
