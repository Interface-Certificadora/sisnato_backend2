
# Módulo da API: Financeiro

**Arquivo:** `src/api/financeiro/`

## Finalidade

O módulo `Financeiro` é responsável pelo CRUD (Create, Read, Update, Delete) das entidades de financeiras (bancos, instituições financeiras, etc.). Ele gerencia as informações cadastrais e as associações com construtoras.

## Lógica de Negócio (FinanceiroService)

O `FinanceiroService` implementa a lógica de negócio para a gestão das financeiras.

*   **Criação (`create`):**
    *   Verifica a existência de um financeiro com o mesmo CNPJ para evitar duplicatas, lançando uma `ConflictException` se encontrado.
    *   Após criar o registro da financeira, ele itera sobre uma lista de IDs de construtoras e cria as associações na tabela pivot `FinanceiroConstrutora`.
*   **Busca (`findAll`, `findOne`):**
    *   O método `findAll` filtra os resultados com base no perfil do usuário. Administradores (`ADM`) veem todas as financeiras, enquanto outros usuários veem apenas aquelas às quais estão associados (via `id: { in: AdminUser.Financeira }`).
    *   O método `findOne` retorna uma financeira específica e inclui as construtoras associadas a ela.
*   **Atualização (`update`):**
    *   Atualiza os dados cadastrais da financeira.
    *   Para atualizar as associações com as construtoras, ele primeiro remove todas as associações existentes na tabela `FinanceiroConstrutora` e depois as recria com base na nova lista de IDs fornecida.
*   **Remoção (`remove`):**
    *   Este é um método de exclusão permanente (hard delete).
    *   Antes de deletar a financeira, ele remove todas as suas associações nas tabelas `FinanceiroConstrutora` e `FinanceiroEmpreendimento` para evitar erros de chave estrangeira.
*   **Logging e Gerenciamento de Conexão:** Todas as operações de CUD são logadas, e o serviço gerencia explicitamente a desconexão do Prisma no bloco `finally`.

## Endpoints da API (FinanceiroController)

Abaixo estão os endpoints expostos pelo `FinanceiroController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/financeiro` | Cria uma nova financeira e a associa a construtoras. | Sim |
| `GET` | `/financeiro` | Lista as financeiras visíveis para o usuário. | Sim |
| `GET` | `/financeiro/:id` | Busca uma financeira específica pelo seu ID. | Sim |
| `PATCH` | `/financeiro/:id` | Atualiza os dados de uma financeira e suas associações. | Sim |
| `DELETE` | `/financeiro/:id` | Remove permanentemente uma financeira e suas associações. | Sim |
