
# Módulo da API: Dashboard

**Arquivo:** `src/api/dashboard/`

## Finalidade

O módulo `Dashboard` é projetado para agregar e processar dados de várias partes do sistema, a fim de fornecer informações consolidadas para a visualização em painéis. Ele busca dados de solicitações, empreendimentos, construtoras e financeiras para gerar métricas e estatísticas.

## Lógica de Negócio (DashboardService)

O `DashboardService` é o coração deste módulo e depende de um `UtilsService` (localizado em `src/api/dashboard/utils/utils.service.ts`, não mostrado aqui) para realizar a maior parte do trabalho pesado de busca e processamento de dados.

*   **Busca de Entidades:** Fornece métodos simples (`getEmpreendimentos`, `getConstrutoras`, `getFinanceiras`) para retornar listas de nomes e IDs, que provavelmente são usados para popular filtros na interface do dashboard.
*   **Dashboard Global (`getDashboard`):**
    *   Calcula as solicitações dos últimos 6 meses.
    *   Utiliza o `UtilsService` para buscar as solicitações (`GetSolicitacaoPorMeses`) e depois contabilizá-las (`ContabilizarMes`).
    *   Busca também as tags de alerta (`GetAlertasCreated`).
    *   Retorna uma contagem de solicitações e um resumo de tags.
*   **Dashboard com Filtros (`getDashboardSearch`):**
    *   Recebe um `FiltroDashboardDto` com IDs de construtora, empreendimento e financeira.
    *   Usa o `UtilsService` para buscar as solicitações que correspondem a esses filtros (`GetSolicitacoesSearch`).
    *   Calcula uma variedade de métricas com base nos resultados filtrados, como:
        *   Total de validações por vídeo vs. outros tipos.
        *   Tempo médio de atendimento (`TimeOutMes`).
        *   Contagem de uploads de RG vs. CNH.
        *   Contagem de chamados de suporte e um resumo de suas tags.
*   **Gerenciamento de Conexão:** Assim como o `ConstrutoraService`, este serviço também chama `this.prismaService.$disconnect()` nos blocos `finally`, indicando uma gestão explícita da conexão com o banco.

## Endpoints da API (DashboardController)

Abaixo estão os endpoints expostos pelo `DashboardController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/empreendimentos` | Retorna uma lista de todos os empreendimentos (ID e nome). | Sim |
| `GET` | `/dashboard/construtoras` | Retorna uma lista de todas as construtoras (ID e nome fantasia). | Sim |
| `GET` | `/dashboard/financeiras` | Retorna uma lista de todas as financeiras (ID e nome fantasia). | Sim |
| `GET` | `/dashboard` | Retorna os dados para o dashboard global (últimos 6 meses). | Sim |
| `POST` | `/dashboard/get/infos/search` | Retorna os dados do dashboard com base nos filtros fornecidos no corpo da requisição. | Sim |
