-- AlterTable
ALTER TABLE "Solicitacao" ALTER COLUMN "log" SET DATA TYPE TEXT[];

-- CreateTable
CREATE TABLE "Logs" (
    "id" SERIAL NOT NULL,
    "User" INTEGER NOT NULL,
    "EffectId" INTEGER NOT NULL,
    "EffectTable" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);
