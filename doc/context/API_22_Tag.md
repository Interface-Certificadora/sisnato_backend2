
# Módulo da API: Tag

**Arquivo:** `src/api/tag/`

## Finalidade

O módulo `Tag` é responsável por gerenciar a associação de tags descritivas a uma `Solicitacao`. Ele permite que os usuários criem, visualizem e removam tags para ajudar a categorizar e organizar as solicitações.

## Lógica de Negócio (TagService)

O `TagService` implementa a lógica de CRUD para as tags, com uma forte dependência do `SolicitacaoService` para obter contexto e do `LogService` para auditoria.

*   **Criação (`create`):**
    *   Cria um novo registro na tabela `Tag`, associando uma `descricao` (o texto da tag) a uma `solicitacao` (o ID da solicitação).
    *   Após a criação, ele busca os dados completos da solicitação (`GetSolicitacaoById`) para poder registrar um log detalhado, incluindo o nome do cliente.
*   **Busca (`findAll`, `findOne`, `findSolicitacaoAll`):** Fornece métodos para buscar todas as tags, uma tag específica por seu ID, ou todas as tags associadas a um ID de solicitação específico.
*   **Atualização (`update`):** Permite alterar a `descricao` de uma tag existente. Assim como na criação, ele busca os dados do cliente para registrar um log completo.
*   **Remoção (`remove`):**
    *   Exclui permanentemente (`hard delete`) um registro de tag do banco de dados.
    *   Antes de deletar, ele busca a tag para saber a qual solicitação ela pertencia, a fim de registrar um log de auditoria preciso.

## Endpoints da API (TagController)

Abaixo estão os endpoints expostos pelo `TagController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/tag` | Cria e associa uma nova tag a uma solicitação. | Sim |
| `GET` | `/tag` | Lista todas as tags existentes no sistema. | Sim |
| `GET` | `/tag/:id` | Busca uma tag específica pelo seu ID. | Sim |
| `GET` | `/tag/solicitacao/:id` | Lista todas as tags associadas a um ID de solicitação. | Sim |
| `PATCH` | `/tag/:id` | Atualiza a descrição de uma tag. | Sim |
| `DELETE` | `/tag/:id` | Remove permanentemente uma tag. | Sim |
