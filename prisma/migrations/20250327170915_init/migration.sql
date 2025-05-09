/*
  Warnings:

  - You are about to drop the column `EffectTable` on the `Logs` table. All the data in the column will be lost.
  - Added the required column `rota` to the `Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Logs" DROP COLUMN "EffectTable",
ADD COLUMN     "rota" TEXT NOT NULL;
