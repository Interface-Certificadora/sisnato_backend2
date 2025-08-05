
# Módulo da API: Empreendimento

**Arquivo:** `src/api/empreendimento/`

## Finalidade

O módulo `Empreendimento` gerencia o CRUD (Create, Read, Update, Delete) para os empreendimentos imobiliários. Ele lida com a criação, associação com construtoras e financeiras, e o controle de acesso baseado no perfil do usuário.

## Lógica de Negócio (EmpreendimentoService)

O `EmpreendimentoService` contém a lógica de negócio para a gestão de empreendimentos.

*   **Criação (`create`):**
    *   Ao criar um novo empreendimento, o serviço também cria as associações na tabela pivot `FinanceiroEmpreendimento` para vincular o empreendimento às financeiras fornecidas.
    *   Se o usuário que cria o empreendimento tem a hierarquia `GRT`, ele é automaticamente associado a esse novo empreendimento na tabela `UserEmpreendimento`.
*   **Busca (`findAll`, `findOne`, etc.):**
    *   O método `findAll` é complexo e personaliza a busca com base na hierarquia do usuário (`CONST`, `GRT`, etc.), garantindo que eles vejam apenas os empreendimentos aos quais têm acesso.
    *   Fornece métodos de busca específicos como `GetAllSearch` (para encontrar empreendimentos por financeira e construtora) e `GetByConstrutora`.
*   **Atualização (`update`):** Permite atualizar os dados do empreendimento. A lógica de atualização das financeiras associadas é feita removendo todas as associações existentes e recriando-as com base na nova lista fornecida.
*   **Remoção (`remove`):** Na verdade, é um toggle (alternância). Ele inverte o valor do campo `status` do empreendimento, ativando-o ou desativando-o.
*   **`GetByConfereList`:** Este método parece ter uma lógica de atribuição. Ele recebe uma lista de financeiras e um ID de usuário, e então cria as associações na tabela `UserFinanceiro`. O nome do método não parece corresponder exatamente à sua função.
*   **Resiliência:** O serviço utiliza um método `executeWithRetry` do `PrismaService`, indicando uma estratégia para tentar novamente as operações de banco de dados em caso de falha.
*   **Logging:** Todas as operações de CUD (Create, Update, Delete) são devidamente registradas.

## Endpoints da API (EmpreendimentoController)

Abaixo estão os endpoints expostos pelo `EmpreendimentoController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/empreendimento` | Cria um novo empreendimento. | Sim |
| `GET` | `/empreendimento` | Lista os empreendimentos visíveis para o usuário. | Sim |
| `GET` | `/empreendimento/search` | Busca empreendimentos por ID de financeira e construtora. | Sim |
| `GET` | `/empreendimento/:id` | Busca um empreendimento específico pelo seu ID. | Sim |
| `PATCH` | `/empreendimento/:id` | Atualiza um empreendimento. | Sim |
| `DELETE` | `/empreendimento/delete/:id` | Ativa ou desativa um empreendimento. | Sim |
| `GET` | `/empreendimento/filter/:id` | Retorna empreendimentos filtrando pelo ID da construtora. | Sim |
| `POST` | `/empreendimento/confer/list` | Associa um usuário a uma lista de financeiras. | Sim |
