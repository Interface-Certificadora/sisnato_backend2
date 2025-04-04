/*
  Warnings:

  - You are about to drop the column `urlSuporte` on the `Suporte` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Suporte" DROP COLUMN "urlSuporte",
ADD COLUMN     "urlveiw" JSONB;
