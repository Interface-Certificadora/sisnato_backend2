/*
  Warnings:

  - You are about to drop the column `log` on the `Solicitacao` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[User,EffectId]` on the table `Logs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Solicitacao" DROP COLUMN "log";

-- CreateIndex
CREATE UNIQUE INDEX "Logs_User_EffectId_key" ON "Logs"("User", "EffectId");

-- AddForeignKey
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_EffectId_fkey" FOREIGN KEY ("EffectId") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
