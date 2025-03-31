/*
  Warnings:

  - Made the column `EffectId` on table `Logs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Logs" ALTER COLUMN "EffectId" SET NOT NULL;
