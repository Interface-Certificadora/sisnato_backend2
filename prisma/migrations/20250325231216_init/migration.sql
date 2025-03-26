-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "telefone" VARCHAR(15),
    "telefone2" VARCHAR(15),
    "dt_nascimento" TIMESTAMP(3),
    "id_fcw" INTEGER,
    "obs" TEXT,
    "cnh" VARCHAR(20),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "uploadCnh" VARCHAR(255),
    "uploadRg" VARCHAR(255),
    "relacionamento" INTEGER[],
    "rela_quest" BOOLEAN NOT NULL DEFAULT false,
    "distrato" BOOLEAN NOT NULL DEFAULT false,
    "dt_distrato" TIMESTAMP(3),
    "log" TEXT[],
    "status_aprovacao" BOOLEAN DEFAULT false,
    "distrato_id" INTEGER,
    "andamento" VARCHAR(100),
    "type_validacao" VARCHAR(50),
    "dt_aprovacao" TIMESTAMP(3),
    "hr_aprovacao" TIMESTAMP(3),
    "dt_agendamento" TIMESTAMP(3),
    "hr_agendamento" TIMESTAMP(3),
    "estatos_pgto" VARCHAR(50),
    "valorcd" DECIMAL(10,2),
    "situacao_pg" INTEGER DEFAULT 0,
    "freqSms" INTEGER DEFAULT 0,
    "alertanow" BOOLEAN DEFAULT false,
    "dt_criacao_now" TIMESTAMP(3),
    "statusAtendimento" BOOLEAN NOT NULL DEFAULT false,
    "pause" BOOLEAN DEFAULT false,
    "corretorId" INTEGER,
    "construtoraId" INTEGER,
    "financeiroId" INTEGER,
    "empreendimentoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "password_key" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(15),
    "email" VARCHAR(100),
    "cpf" VARCHAR(14),
    "nome" VARCHAR(255),
    "empreendimentoId" INTEGER,
    "construtoraId" INTEGER,
    "financeiroId" INTEGER,
    "cargo" VARCHAR(100),
    "hierarquia" VARCHAR(100),
    "reset_password" BOOLEAN DEFAULT true,
    "status" BOOLEAN DEFAULT false,
    "sms_relat" BOOLEAN DEFAULT false,
    "termos" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Construtora" (
    "id" SERIAL NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "razaosocial" VARCHAR(255) NOT NULL,
    "fantasia" VARCHAR(255),
    "tel" VARCHAR(15),
    "email" VARCHAR(100),
    "tipo" VARCHAR(50),
    "atividade" VARCHAR(100),
    "obs" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "valor_cert" DECIMAL(10,2),
    "financeiroId" INTEGER,
    "responsavelId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Construtora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financeiro" (
    "id" SERIAL NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "razaosocial" VARCHAR(255) NOT NULL,
    "fantasia" VARCHAR(255),
    "tel" VARCHAR(15),
    "email" VARCHAR(100),
    "tipo" VARCHAR(50),
    "obs" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "autorId" INTEGER,
    "responsavelId" INTEGER,
    "empreendimentoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empreendimento" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "endereco" VARCHAR(255),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(2),
    "cep" VARCHAR(10),
    "telefone" VARCHAR(15),
    "email" VARCHAR(100),
    "tipo" VARCHAR(50),
    "obs" TEXT,
    "dt_inicio" TIMESTAMP(3),
    "dt_fim" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "valor_cert" DECIMAL(10,2),
    "chave" VARCHAR(50),
    "tag" VARCHAR(50),
    "construtoraId" INTEGER,
    "responsavelId" INTEGER,
    "vendedores" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empreendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT,
    "texto" TEXT,
    "solicitacao_id" INTEGER,
    "corretor" INTEGER,
    "tipo" TEXT,
    "tag" TEXT,
    "empreendimento" INTEGER,
    "status" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suporte" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "descricao" TEXT,
    "solicitacao" INTEGER,
    "urlSuporte" TEXT,
    "imgSuspensa" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Suporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "solicitacao" INTEGER,
    "descricao" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" SERIAL NOT NULL,
    "solicitacao" INTEGER,
    "descricao" TEXT,
    "status" INTEGER,
    "images" TEXT,
    "images_adm" TEXT,
    "idUser" INTEGER,
    "idResposta" INTEGER,
    "resposta" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_financeiro" (
    "id" SERIAL NOT NULL,
    "protocolo" TEXT,
    "situacao_pg" INTEGER NOT NULL DEFAULT 0,
    "nota_fiscal" TEXT,
    "solicitacao" TEXT NOT NULL,
    "construtora" INTEGER,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "statusNota" BOOLEAN DEFAULT false,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "relatorio_financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmpreendimentoToSolicitacao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmpreendimentoToSolicitacao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChamadoToSolicitacao" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChamadoToSolicitacao_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "idx_solicitacao_cpf" ON "Solicitacao"("cpf");

-- CreateIndex
CREATE INDEX "idx_solicitacao_email" ON "Solicitacao"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_username" ON "User"("username");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_cpf" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Construtora_cnpj_key" ON "Construtora"("cnpj");

-- CreateIndex
CREATE INDEX "idx_construtora_cnpj" ON "Construtora"("cnpj");

-- CreateIndex
CREATE INDEX "idx_construtora_razaosocial" ON "Construtora"("razaosocial");

-- CreateIndex
CREATE UNIQUE INDEX "Financeiro_cnpj_key" ON "Financeiro"("cnpj");

-- CreateIndex
CREATE INDEX "idx_financeiro_cnpj" ON "Financeiro"("cnpj");

-- CreateIndex
CREATE INDEX "idx_financeiro_razaosocial" ON "Financeiro"("razaosocial");

-- CreateIndex
CREATE INDEX "idx_empreendimento_nome" ON "Empreendimento"("nome");

-- CreateIndex
CREATE INDEX "idx_empreendimento_localizacao" ON "Empreendimento"("cidade", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_financeiro_protocolo_key" ON "relatorio_financeiro"("protocolo");

-- CreateIndex
CREATE INDEX "_EmpreendimentoToSolicitacao_B_index" ON "_EmpreendimentoToSolicitacao"("B");

-- CreateIndex
CREATE INDEX "_ChamadoToSolicitacao_B_index" ON "_ChamadoToSolicitacao"("B");

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Construtora" ADD CONSTRAINT "Construtora_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Construtora" ADD CONSTRAINT "Construtora_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_construtoraId_fkey" FOREIGN KEY ("construtoraId") REFERENCES "Construtora"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_solicitacao_id_fkey" FOREIGN KEY ("solicitacao_id") REFERENCES "Solicitacao"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_corretor_fkey" FOREIGN KEY ("corretor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_empreendimento_fkey" FOREIGN KEY ("empreendimento") REFERENCES "Empreendimento"("id") ON DELETE NO ACTION ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_solicitacao_fkey" FOREIGN KEY ("solicitacao") REFERENCES "Solicitacao"("id") ON DELETE NO ACTION ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "_EmpreendimentoToSolicitacao" ADD CONSTRAINT "_EmpreendimentoToSolicitacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Empreendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmpreendimentoToSolicitacao" ADD CONSTRAINT "_EmpreendimentoToSolicitacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChamadoToSolicitacao" ADD CONSTRAINT "_ChamadoToSolicitacao_A_fkey" FOREIGN KEY ("A") REFERENCES "Chamado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChamadoToSolicitacao" ADD CONSTRAINT "_ChamadoToSolicitacao_B_fkey" FOREIGN KEY ("B") REFERENCES "Solicitacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
