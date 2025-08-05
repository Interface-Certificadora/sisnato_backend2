
# Módulo da API: Construtora

**Arquivo:** `src/api/construtora/`

## Finalidade

O módulo `Construtora` é responsável pelo CRUD (Create, Read, Update, Delete) das entidades de construtoras no sistema. Ele gerencia todas as informações relacionadas às construtoras, incluindo seus dados cadastrais e os colaboradores associados.

## Lógica de Negócio (ConstrutoraService)

O `ConstrutoraService` implementa a lógica de negócio para a gestão de construtoras.

*   **Criação:** O método `create` verifica primeiro se o CNPJ da nova construtora já existe no banco de dados para evitar duplicatas. Se não existir, ele cria um novo registro e loga a ação.
*   **Busca (`findAll` e `findOne`):**
    *   A busca de construtoras é sensível ao perfil do usuário. Administradores (`ADM`) têm uma visão completa, enquanto outros usuários veem apenas as construtoras às quais estão associados (`id: { in: User.construtora }`).
    *   O método `findAll` utiliza o decorator `@DatabaseResilient`, indicando uma estratégia de resiliência a falhas de banco de dados.
    *   Os dados retornados incluem uma lista de colaboradores, que é achatada para facilitar o consumo no front-end.
*   **Atualização:** O método `update` permite a modificação dos dados de uma construtora existente.
*   **Remoção (Desativação):** O método `remove` não deleta o registro, mas o desativa, setando o campo `status` para `false`. Há uma regra de negócio que impede a desativação de uma construtora que também é uma "Certificadora" (`atividade === 'CERT'`).
*   **Logging:** Todas as operações de criação, atualização e remoção são devidamente registradas pelo `LogService`.
*   **Gerenciamento de Conexão:** O serviço utiliza `this.prismaService.$disconnect()` nos blocos `finally`, o que pode ser uma estratégia para gerenciar explicitamente as conexões com o banco de dados.

## Endpoints da API (ConstrutoraController)

Abaixo estão os endpoints expostos pelo `ConstrutoraController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/construtora` | Cria uma nova construtora. | Sim |
| `GET` | `/construtora` | Lista todas as construtoras visíveis para o usuário. | Sim |
| `GET` | `/construtora/:id` | Busca uma construtora específica pelo seu ID. | Sim |
| `PATCH` | `/construtora/:id` | Atualiza os dados de uma construtora. | Sim |
| `DELETE` | `/construtora/:id` | Desativa uma construtora (não a remove). | Sim |
