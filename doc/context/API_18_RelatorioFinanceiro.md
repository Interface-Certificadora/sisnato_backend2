
# Módulo da API: Relatório Financeiro

**Arquivo:** `src/api/relatorio_financeiro/`

## Finalidade

Este é um módulo complexo e central para a aplicação, responsável por gerar, gerenciar e distribuir relatórios financeiros. Ele agrega dados de múltiplas fontes, incluindo o banco de dados principal (via Prisma) e um banco de dados legado (via Sequelize/FcwebProvider), para compilar informações detalhadas sobre as solicitações e seus custos. O módulo também se integra com o RabbitMQ para processamento assíncrono e com o S3 para armazenamento dos arquivos gerados (PDF e XLSX).

## Lógica de Negócio (RelatorioFinanceiroService)

O `RelatorioFinanceiroService` orquestra um fluxo de trabalho complexo:

*   **Criação de Relatório (`create`):**
    1.  **Busca de Solicitações:** Inicia buscando no banco de dados principal todas as solicitações (`ListaSolicitacoes`) para uma determinada construtora e período.
    2.  **Enriquecimento de Dados:** Itera sobre cada solicitação e busca informações adicionais no banco de dados legado (`GetAllFcweb`), como andamento, forma de pagamento, etc.
    3.  **Lógica de Negócio:** Aplica regras de negócio, como incluir solicitações revogadas apenas se a revogação ocorreu após 6 dias da aprovação.
    4.  **Agrupamento:** Agrupa as solicitações por empreendimento, calculando totais e valores.
    5.  **Persistência:** Salva o relatório consolidado no banco de dados principal na tabela `relatorio_financeiro`.
    6.  **Processamento Assíncrono:** Envia uma mensagem para uma fila do RabbitMQ (`processar_relatorio`) para que outro serviço (provavelmente um worker) processe esses dados, possivelmente para gerar os arquivos PDF e XLSX em background.
*   **Geração de Arquivos (`relatorioFinanceiroPdf`, `relatorioFinanceiroXlsx`):**
    *   Esses métodos funcionam com uma lógica de *lazy generation*. Eles primeiro verificam se o arquivo (PDF ou XLSX) já foi gerado e tem seu nome salvo no banco.
    *   Se não foi gerado, eles invocam o `PdfCreateService` para criar o arquivo, salvam o nome do arquivo no banco e o retornam.
    *   Se já existe, apenas retornam o nome do arquivo salvo.
*   **Distribuição de Arquivos (Controller):** O controller usa os nomes dos arquivos retornados pelo serviço para baixá-los do S3 e transmiti-los ao cliente, seja para visualização (`inline`) ou para download (`attachment`).
*   **CRUD e Pesquisa:** Fornece endpoints padrão para listar, buscar, atualizar e remover relatórios. A remoção é um *soft delete* (muda o status para `false`) e também dispara uma mensagem no RabbitMQ para notificar outros sistemas.
*   **Agregação Geral (`relatorioFinanceiroGeral`):** Fornece um endpoint que retorna números gerais sobre a plataforma, como total de usuários, construtoras, relatórios e o valor total das cobranças em aberto.

## Endpoints da API (RelatorioFinanceiroController)

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/relatorio` | Inicia a criação de um novo relatório financeiro. | Sim |
| `GET` | `/relatorio/view/pdf/:protocolo` | Retorna um PDF para visualização no navegador. | Sim |
| `GET` | `/relatorio/download/pdf/:protocolo` | Força o download de um relatório em PDF. | Sim |
| `GET` | `/relatorio/view/xlsx/:protocolo` | Retorna um XLSX para visualização (se o navegador suportar). | Sim |
| `GET` | `/relatorio/download/xlsx/:protocolo` | Força o download de um relatório em XLSX. | Sim |
| `GET` | `/relatorio` | Lista todos os relatórios financeiros. | Sim |
| `GET` | `/relatorio/:id` | Busca um relatório financeiro pelo seu ID. | Sim |
| `PATCH` | `/relatorio/:id` | Atualiza os dados de um relatório. | Sim |
| `DELETE` | `/relatorio/:id` | Desativa (soft delete) um relatório financeiro. | Sim |
| `POST` | `/relatorio/pesquisa` | Pesquisa relatórios por CNPJ ou nome da construtora. | Sim |
| `GET` | `/relatorio/numeros/geral` | Retorna estatísticas gerais da plataforma. | Sim |
| `GET` | `/relatorio/update/status/:id` | Confirma o pagamento de um relatório. | Sim |
