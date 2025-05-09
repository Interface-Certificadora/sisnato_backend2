-- DropForeignKey
ALTER TABLE "FinanceiroConstrutora" DROP CONSTRAINT "FinanceiroConstrutora_construtoraId_fkey";

-- DropForeignKey
ALTER TABLE "FinanceiroConstrutora" DROP CONSTRAINT "FinanceiroConstrutora_financeiroId_fkey";

-- AddForeignKey
ALTER TABLE "FinanceiroConstrutora" ADD CONSTRAINT "FinanceiroConstrutora_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceiroConstrutora" ADD CONSTRAINT "FinanceiroConstrutora_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
