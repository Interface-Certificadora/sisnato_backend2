
# Módulo da API: Get-Infos

**Arquivo:** `src/api/get-infos/`

## Finalidade

O módulo `Get-Infos` funciona como um agregador de dados diversos, fornecendo endpoints para buscar informações que são frequentemente usadas em várias partes da aplicação, como em formulários, seletores e verificações. Ele busca dados de diferentes tabelas (`Solicitacao`, `Termo`, `Construtora`, `User`, etc.) para entregar informações prontas para o consumo.

## Lógica de Negócio (GetInfosService)

O `GetInfosService` é responsável por realizar as consultas complexas para agregar as informações necessárias.

*   **Verificação de CPF (`checkCpf`):** Verifica se um CPF já existe na base de dados de `Solicitacao`. A lógica de busca difere com base na hierarquia do usuário: administradores (`ADM`) podem ver todos os registros, enquanto outros usuários têm uma visão filtrada (apenas solicitações ativas, com andamento específico e dentro das suas construtoras associadas).
*   **Busca de Termos (`getTermos`):** Retorna o conteúdo dos termos de uso armazenados na tabela `Termo`.
*   **Opções para Formulários (`getOptionsAdmin`, `getOptionsUser`):**
    *   `getOptionsAdmin`: Retorna uma lista de todas as construtoras e seus respectivos empreendimentos.
    *   `getOptionsUser`: Retorna uma lista de construtoras, empreendimentos e financeiras, mas filtrada para mostrar apenas as entidades às quais o usuário logado tem acesso.
*   **Busca de Corretores (`getCorretores`):** Este é um método complexo que, dado um ID de empreendimento e construtora, encontra os corretores (`User`) que estão associados a ambos, e também às financeiras daquele empreendimento. Retorna uma lista de corretores e financeiras elegíveis.
*   **Gerenciamento de Conexão:** O serviço gerencia explicitamente a desconexão do Prisma no bloco `finally` de suas funções.

## Endpoints da API (GetInfosController)

Abaixo estão os endpoints expostos pelo `GetInfosController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `GET` | `/get-infos/checkcpf/:cpf` | Verifica a existência de um CPF no banco de dados. | Sim |
| `GET` | `/get-infos/termos` | Retorna o HTML dos termos de uso. | Sim |
| `GET` | `/get-infos/options-admin` | Retorna uma lista de construtoras e empreendimentos para administradores. | Sim |
| `GET` | `/get-infos/options-user` | Retorna uma lista de entidades (construtoras, etc.) filtrada por usuário. | Sim |
| `POST` | `/get-infos/get-corretores` | Busca corretores e financeiras com base no empreendimento e construtora. | Sim |
