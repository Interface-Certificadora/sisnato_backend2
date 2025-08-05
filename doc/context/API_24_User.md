
# Módulo da API: User

**Arquivo:** `src/api/user/`

## Finalidade

O módulo `User` é fundamental para a aplicação, gerenciando o CRUD completo dos usuários, suas permissões, associações e autenticação. Ele lida com a criação de novos usuários, validação de dados, atualização de informações, reset de senha e controle de acesso a outras entidades do sistema.

## Lógica de Negócio (UserService)

O `UserService` é um serviço robusto com uma lógica de negócio complexa:

*   **Criação (`create`):**
    *   Realiza múltiplas validações para garantir a unicidade de `username`, `email` e `cpf`.
    *   Verifica se a senha e a confirmação de senha coincidem.
    *   Cria o usuário e, se ele não for um `ADM`, cria as associações com `Construtora`, `Empreendimento` e `Financeiro` nas respectivas tabelas pivot.
    *   Armazena a senha como um hash usando `bcrypt`.
*   **Busca (`findAll`, `findOne`, `search`):**
    *   `findAll`: A busca de usuários é sensível à hierarquia. `ADM`s veem todos, enquanto outros usuários veem apenas os usuários que compartilham as mesmas construtoras, empreendimentos ou financeiras.
    *   `findOne`: Retorna um usuário específico com todas as suas associações (construtoras, empreendimentos, financeiros).
    *   `search`: Permite uma busca genérica por vários campos como CPF, e-mail, telefone, etc.
*   **Atualização (`update`, `primeAcess`, `updateTermos`):**
    *   `update`: Permite a atualização dos dados do usuário. A lógica para atualizar as associações (construtoras, etc.) é feita removendo todas as associações antigas e recriando-as com base na nova lista.
    *   `primeAcess`: Usado para o reset de senha, onde uma nova senha é definida e a flag `reset_password` é setada para `false`.
    *   `updateTermos`: Atualiza a flag `termos` para indicar que o usuário aceitou os termos de uso.
*   **Remoção e Suspensão (`remove`, `suspense`):**
    *   `remove`: É um *hard delete*, que remove permanentemente o usuário do banco.
    *   `suspense`: É um *soft delete*, que apenas define o `status` do usuário como `false`.
*   **Permissões (`userRole`):**
    *   Este é um endpoint crucial que retorna um objeto consolidado com todas as permissões e associações de um usuário (hierarquia, status, e listas de construtoras, empreendimentos e financeiras associadas).
    *   Utiliza o decorator `@DatabaseResilient`, indicando que, se o banco de dados estiver indisponível, ele retornará um objeto de fallback com permissões mínimas para garantir que a aplicação não quebre completamente.

## Endpoints da API (UserController)

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/user` | Cria um novo usuário. | Não |
| `GET` | `/user` | Lista os usuários com base nas permissões do requisitante. | Sim |
| `GET` | `/user/get/:id` | Busca um usuário específico pelo seu ID. | Sim |
| `GET` | `/user/construtora/:id` | Busca corretores por ID de construtora. | Sim |
| `PATCH` | `/user/update/:id` | Atualiza os dados e associações de um usuário. | Sim |
| `PATCH` | `/user/reset_password/:id` | Reseta a senha de um usuário. | Sim |
| `DELETE` | `/user/suspense/:id` | Suspende (desativa) um usuário. | Sim |
| `DELETE` | `/user/delete/:id` | Remove permanentemente um usuário. | Sim |
| `GET` | `/user/Busca` | Realiza uma busca genérica por usuários. | Sim |
| `GET` | `/user/termos/:id` | Verifica se um usuário aceitou os termos. | Sim |
| `PATCH` | `/user/aceitar/:id` | Define que um usuário aceitou os termos. | Sim |
| `GET` | `/user/role/:id` | Busca o perfil de permissões completo de um usuário. | Não |
