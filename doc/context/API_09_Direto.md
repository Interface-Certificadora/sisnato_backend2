
# Módulo da API: Direto

**Arquivo:** `src/api/direto/`

## Finalidade

O módulo `Direto` parece gerenciar um tipo especial de `Solicitacao`, que é marcada com a flag `direto: true`. Ele essencialmente reutiliza a tabela `Solicitacao` para criar, ler, atualizar e desativar esses registros "diretos". Além disso, ele possui uma funcionalidade para buscar as financeiras associadas a um usuário específico.

## Lógica de Negócio (DiretoService)

O `DiretoService` implementa a lógica para manipular essas solicitações diretas.

*   **Criação (`create`):** Antes de criar uma nova solicitação, ele verifica se o CPF já existe para evitar duplicatas. Ao criar, ele define explicitamente `direto: true` e pode associar uma financeira (`financeiroId`).
*   **Busca (`findAll`, `findOne`):** Os métodos de busca são filtrados para retornar apenas os registros onde `direto: true`.
*   **Atualização (`update`):** Permite a atualização dos dados da solicitação e também a alteração da financeira associada. A ação é registrada no log.
*   **Remoção (`remove`):** Na verdade, é uma desativação. Ele atualiza o registro, definindo `ativo: false`, e loga a operação.
*   **Busca de Financeiras do Usuário (`getFinanceirosDoUsuario`):** Este método busca todas as financeiras que estão associadas a um determinado `User` e que também possuem a flag `direto: true`. É uma consulta específica para encontrar as financeiras "diretas" de um usuário.
*   **Gerenciamento de Conexão:** O serviço utiliza `this.prismaService.$disconnect` (note a falta de parênteses, o que pode ser um bug, deveria ser `$disconnect()`) nos blocos `finally`.

## Endpoints da API (DiretoController)

Abaixo estão os endpoints expostos pelo `DiretoController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/direto` | Cria uma nova solicitação do tipo "Direto". | Sim |
| `GET` | `/direto` | Lista todas as solicitações do tipo "Direto". | Sim |
| `GET` | `/direto/:id` | Busca uma solicitação "Direto" específica pelo seu ID. | Sim |
| `PATCH` | `/direto/:id` | Atualiza uma solicitação "Direto". | Sim |
| `DELETE` | `/direto/:id` | Desativa uma solicitação "Direto". | Sim |
| `GET` | `/direto/financeiras/:id` | Busca as financeiras com a flag `direto: true` associadas a um ID de usuário. | Sim |
