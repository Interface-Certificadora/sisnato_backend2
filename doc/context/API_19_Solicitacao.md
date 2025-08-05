
# Módulo da API: Solicitacao

**Arquivo:** `src/api/solicitacao/`

## Finalidade

O módulo `Solicitacao` é o núcleo do sistema, gerenciando o ciclo de vida completo de uma solicitação de cliente. Ele lida com a criação, busca, atualização e diversas outras operações de negócio, como distratos, pausas e comunicação por SMS. Este módulo é altamente complexo, com integrações com um banco de dados legado (via Sequelize) e uma lógica de negócios rica.

## Lógica de Negócio (SolicitacaoService)

O `SolicitacaoService` é um dos serviços mais complexos da aplicação, com várias responsabilidades:

*   **Criação (`create`):**
    *   Verifica se já existe uma solicitação para o mesmo CPF que não esteja em um estado final (`APROVADO`, `EMITIDO`, `REVOGADO`).
    *   Se o cliente já existe, mas o usuário atual não tem acesso a ele, o serviço cria um `Chamado` interno para que um administrador possa avaliar a importação do cliente para o novo usuário.
    *   Se o cliente não existe, ele cria a nova solicitação no banco de dados principal.
    *   A lógica de envio de SMS está comentada, indicando que pode ter sido desativada ou está em desenvolvimento.
*   **Busca (`findAll`):**
    *   Implementa uma busca com paginação e filtros complexos.
    *   O filtro de segurança é altamente granular, aplicando diferentes regras de visibilidade com base na hierarquia do usuário (`USER`, `CONST`, `CCA`, `ADM`, etc.).
    *   **Sincronização com Legado:** Durante a busca, ele tenta atualizar o status da solicitação (`andamento`, datas, etc.) com informações do banco de dados legado (Fcweb). Isso é feito de forma assíncrona para não bloquear a resposta.
*   **Atualização (`update`):** Permite a atualização de múltiplos campos da solicitação, incluindo o re-relacionamento com corretor, financeira, construtora e empreendimento.
*   **Operações de Negócio:**
    *   `remove`: É um *soft delete*, desativando a solicitação.
    *   `distrato`: Marca uma solicitação como distratada.
    *   `novo_acordo`: Reverte um distrato.
    *   `pause`: Alterna o status de pausa de uma solicitação.
    *   `Atendimento`: Alterna o status de atendimento da solicitação.
    *   `PostTags`: Adiciona tags a uma solicitação.
*   **Integração com Legado (`GetFcweb`, `GetFcwebExist`):** Possui métodos dedicados para buscar dados no sistema Fcweb, com uma estratégia de resiliência (`safeSequelizeOperation`) para lidar com a indisponibilidade do banco de dados legado.
*   **Busca de Alertas "Now" (`listNowConst`, `listNowGet`):** Fornece endpoints para contar e listar solicitações que têm o alerta `alertanow` ativo.
*   **Chat e Logs:** Permite adicionar mensagens de chat (salvas no campo `obs`) e buscar o histórico de logs de uma solicitação.

## Endpoints da API (SolicitacaoController)

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/solicitacao` | Cria uma nova solicitação. | Sim |
| `GET` | `/solicitacao` | Busca solicitações com filtros e paginação. | Sim |
| `GET` | `/solicitacao/:id` | Busca uma solicitação específica pelo seu ID. | Sim |
| `GET` | `/solicitacao/send/:id` | Reenvia uma mensagem de boas-vindas por SMS. | Sim |
| `PUT` | `/solicitacao/update/:id` | Atualiza os dados de uma solicitação. | Sim |
| `PUT` | `/solicitacao/reativar/:id` | Reativa uma solicitação que foi desativada. | Sim |
| `PUT` | `/solicitacao/atendimento/:id` | Alterna o status de atendimento. | Sim |
| `DELETE` | `/solicitacao/delete/:id` | Desativa (soft delete) uma solicitação. | Sim |
| `PUT` | `/solicitacao/distrato/:id` | Marca uma solicitação como distratada. | Sim |
| `PUT` | `/solicitacao/novo_acordo/:id` | Reverte um distrato. | Sim |
| `POST` | `/solicitacao/post/tags` | Adiciona tags a uma solicitação. | Sim |
| `PUT` | `/solicitacao/pause/:id` | Pausa ou retoma uma solicitação. | Sim |
| `PUT` | `/solicitacao/fcweb/:id` | Atualiza a solicitação com dados do sistema legado Fcweb. | Sim |
| `GET` | `/solicitacao/list/now/cont` | Conta as solicitações com o alerta "Now" ativo. | Sim |
| `GET` | `/solicitacao/list/now/get` | Lista as solicitações com o alerta "Now" ativo. | Sim |
| `PATCH` | `/solicitacao/chat/:id` | Adiciona uma mensagem ao chat (campo `obs`) da solicitação. | Sim |
| `GET` | `/solicitacao/getlogs/:id` | Busca o histórico de logs de uma solicitação. | Sim |
