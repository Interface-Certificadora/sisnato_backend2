/*
  Warnings:

  - You are about to alter the column `valor_cert` on the `Construtora` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Construtora" ALTER COLUMN "valor_cert" SET DEFAULT 0,
ALTER COLUMN "valor_cert" SET DATA TYPE DOUBLE PRECISION;
