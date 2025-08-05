
# Módulo da API: Bug

**Arquivo:** `src/api/bug/`

## Finalidade

O módulo `Bug` fornece uma maneira simples de registrar e consultar relatos de bugs na aplicação. Ele permite que usuários autenticados criem novos registros de bugs e que a equipe de desenvolvimento os visualize e gerencie.

## Lógica de Negócio (BugService)

O `BugService` é responsável pela interação com a tabela `Bug` no banco de dados.

*   **Criação de Bugs:** O método `create` recebe um `CreateBugDto` e salva um novo registro de bug no banco de dados.
*   **Listagem de Bugs:** O método `findAll` retorna uma lista de todos os bugs que estão com o status `true`. Ele também utiliza um decorator `@DatabaseResilient`, sugerindo que possui uma estratégia de resiliência para falhas de conexão com o banco de dados, retornando um valor de fallback (uma lista vazia) em caso de erro.
*   **Remoção de Bugs:** O método `remove` exclui permanentemente um registro de bug do banco de dados pelo seu ID.

## Endpoints da API (BugController)

Abaixo estão os endpoints expostos pelo `BugController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/bug` | Cria um novo registro de bug. | Sim |
| `GET` | `/bug` | Lista todos os bugs ativos. | Sim |
| `DELETE` | `/bug/delete/:id` | Remove um bug pelo seu ID. | Sim |
