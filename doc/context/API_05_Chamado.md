
# Módulo da API: Chamado

**Arquivo:** `src/api/chamado/`

## Finalidade

O módulo `Chamado` implementa um sistema de tickets de suporte. Ele permite que os usuários criem, visualizem, atualizem e fechem chamados. O módulo também inclui funcionalidades para anexar imagens, manter um histórico de chat e filtrar chamados com base em diferentes critérios.

## Lógica de Negócio (ChamadoService)

O `ChamadoService` orquestra todas as operações relacionadas aos chamados.

*   **Criação e Atualização:** Os métodos `create` e `update` lidam com a criação e modificação de chamados. Eles também registram logs detalhados de cada operação usando o `LogService`.
*   **Busca de Chamados:**
    *   O método `findAll` é complexo e demonstra uma abordagem de segurança e performance. Ele usa uma query SQL crua (`$queryRaw`) para buscar chamados, aplicando diferentes condições com base na hierarquia do usuário. Administradores (`ADM`) podem ver todos os chamados não fechados dos últimos 30 dias, enquanto usuários normais veem apenas os seus próprios chamados não fechados.
    *   O serviço também oferece métodos para buscar um chamado específico (`findOne`) e um método de pesquisa genérico (`pesquisar`) que filtra com base nos parâmetros da query.
*   **Contagem:** O método `countTotal` retorna o número de chamados que estão com o status "Aberto".
*   **Remoção:** O método `remove` na verdade não fecha, mas deleta um chamado. A ação é logada.
*   **Error Handling:** O serviço utiliza um `ErrorService` para logar exceções, garantindo que os erros sejam registrados para análise posterior.

## Endpoints da API (ChamadoController)

Abaixo estão os endpoints expostos pelo `ChamadoController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/chamado` | Cria um novo chamado. | Sim |
| `GET` | `/chamado` | Retorna uma lista de chamados com base no perfil do usuário. | Sim |
| `GET` | `/chamado/pesquisar` | Pesquisa chamados com base em parâmetros de query. | Sim |
| `GET` | `/chamado/:id` | Retorna um chamado específico pelo seu ID. | Sim |
| `PATCH` | `/chamado/atualizar/:id` | Atualiza um chamado existente. | Sim |
| `DELETE` | `/chamado/:id` | Deleta um chamado pelo seu ID. | Sim |
| `GET` | `/chamado/count/total` | Retorna a contagem total de chamados abertos. | Sim |
