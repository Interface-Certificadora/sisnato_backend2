/*
  Warnings:

  - The `images` column on the `Chamado` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `images_adm` column on the `Chamado` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Chamado" DROP COLUMN "images",
ADD COLUMN     "images" JSONB[],
DROP COLUMN "images_adm",
ADD COLUMN     "images_adm" JSONB[];
