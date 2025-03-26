/*
  Warnings:

  - The `log` column on the `Solicitacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Solicitacao" DROP COLUMN "log",
ADD COLUMN     "log" JSONB[];

-- DropTable
DROP TABLE "Logs";
