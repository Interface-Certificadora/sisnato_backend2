/*
  Warnings:

  - The `urlveiw` column on the `Suporte` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Suporte" DROP COLUMN "urlveiw",
ADD COLUMN     "urlveiw" JSONB[];
