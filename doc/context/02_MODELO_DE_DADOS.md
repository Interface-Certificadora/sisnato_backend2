
# Modelo de Dados (schema.prisma)

O modelo de dados do `sisnato_backend2` é definido no arquivo `prisma/schema.prisma` e utiliza o Prisma como ORM. Abaixo está a documentação de cada uma das tabelas (models) do banco de dados PostgreSQL.

## Models Principais

### `Solicitacao`

Armazena as solicitações feitas pelos clientes. É uma das tabelas centrais do sistema.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `Int` | Identificador único (PK). |
| `nome` | `String` | Nome do solicitante. |
| `email` | `String` | E-mail do solicitante. |
| `cpf` | `String` | CPF do solicitante. |
| `telefone` | `String?` | Telefone principal. |
| `telefone2` | `String?` | Telefone secundário. |
| `dt_nascimento` | `DateTime?` | Data de nascimento. |
| `cnh` | `String?` | Número da CNH. |
| `ativo` | `Boolean` | Indica se a solicitação está ativa. |
| `status_aprovacao` | `Boolean?` | Status da aprovação. |
| `dt_agendamento` | `DateTime?` | Data do agendamento. |
| `hr_agendamento` | `DateTime?` | Hora do agendamento. |
| `situacao_pg` | `Int?` | Situação do pagamento. |
| `corretorId` | `Int?` | ID do corretor associado (FK para `User`). |
| `construtoraId` | `Int?` | ID da construtora associada (FK para `Construtora`). |
| `financeiroId` | `Int?` | ID da financeira associada (FK para `Financeiro`). |
| `empreendimentoId` | `Int?` | ID do empreendimento associado (FK para `Empreendimento`). |
| `uploadCnh` | `Json?` | Dados do upload da CNH. |
| `uploadRg` | `Json?` | Dados do upload do RG. |
| `obs` | `Json[]` | Array de observações. |

### `User`

Gerencia os usuários do sistema, incluindo corretores, administradores e outros colaboradores.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `Int` | Identificador único (PK). |
| `username` | `String` | Nome de usuário para login (único). |
| `password` | `String` | Senha (hash). |
| `email` | `String?` | E-mail do usuário (único). |
| `nome` | `String?` | Nome completo do usuário. |
| `cargo` | `String?` | Cargo do usuário. |
| `hierarquia` | `String?` | Nível de hierarquia. |
| `status` | `Boolean?` | Indica se o usuário está ativo. |
| `role` | `Json?` | Permissões e papéis do usuário. |

### `Construtora`

Armazena informações sobre as construtoras parceiras.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `Int` | Identificador único (PK). |
| `cnpj` | `String` | CNPJ da construtora (único). |
| `razaosocial` | `String` | Razão social. |
| `fantasia` | `String?` | Nome fantasia. |
| `status` | `Boolean` | Indica se a construtora está ativa. |

### `Financeiro`

Gerencia as informações das instituições financeiras.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `Int` | Identificador único (PK). |
| `cnpj` | `String` | CNPJ da financeira (único). |
| `razaosocial` | `String` | Razão social. |
| `fantasia` | `String?` | Nome fantasia. |

### `Empreendimento`

Contém os dados dos empreendimentos imobiliários.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `Int` | Identificador único (PK). |
| `nome` | `String` | Nome do empreendimento. |
| `endereco` | `String?` | Endereço completo. |
| `construtoraId` | `Int?` | ID da construtora responsável (FK para `Construtora`). |
| `responsavelId` | `Int?` | ID do usuário responsável (FK para `User`). |

## Models de Suporte e Relacionamento

*   **`Alert`**: Alertas associados a uma `Solicitacao` e a um `User` (corretor).
*   **`Suporte`**: Registros de chamados de suporte.
*   **`Tag` / `TagList`**: Sistema de tags para categorizar solicitações.
*   **`Chamado`**: Sistema de chamados interno, com status, prioridade e chat.
*   **`relatorio_financeiro`**: Armazena dados para relatórios financeiros, incluindo notas fiscais e valores.
*   **`Logs`**: Tabela para registrar logs de atividades importantes no sistema.
*   **`Bug`**: Registros de bugs encontrados na plataforma.
*   **`SystemMessage`**: Mensagens globais do sistema.

## Tabelas Pivot (Muitos-para-Muitos)

O schema utiliza tabelas pivot para gerenciar relacionamentos de muitos-para-muitos, seguindo a convenção do Prisma:

*   **`UserEmpreendimento`**: Associa `User` a `Empreendimento`.
*   **`UserConstrutora`**: Associa `User` a `Construtora`.
*   **`UserFinanceiro`**: Associa `User` a `Financeiro`.
*   **`FinanceiroEmpreendimento`**: Associa `Financeiro` a `Empreendimento`.
*   **`FinanceiroConstrutora`**: Associa `Financeiro` a `Construtora`.
