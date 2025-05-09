-- CreateTable
CREATE TABLE "Termo" (
    "id" SERIAL NOT NULL,
    "termo" TEXT NOT NULL,
    "politica" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Termo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Termo_id_key" ON "Termo"("id");
