
# Módulo da API: Suporte

**Arquivo:** `src/api/suporte/`

## Finalidade

O módulo `Suporte` gerencia os registros de suporte associados a uma `Solicitacao`. Ele permite a criação de tickets de suporte, incluindo a possibilidade de anexar múltiplos arquivos (imagens, documentos, etc.), que são armazenados no S3.

## Lógica de Negócio (SuporteService)

O `SuporteService` implementa a lógica de CRUD para os registros de suporte, com uma forte integração com o S3 para o gerenciamento de arquivos.

*   **Criação (`create`):**
    *   O `SuporteController` primeiro lida com o upload dos arquivos. Ele itera sobre os arquivos recebidos, gera um nome único para cada um e os envia para o S3 no setor `suporte`.
    *   As URLs de visualização e download de cada arquivo são salvas no campo `urlview` do DTO.
    *   O `SuporteService` então cria o registro de suporte no banco de dados com os dados e as URLs dos arquivos.
*   **Busca (`findAll`, `findOne`):** Fornece métodos padrão para buscar todos os registros de suporte de uma `Solicitacao` ou um registro específico por ID.
*   **Atualização (`update`):**
    *   Permite a atualização dos dados textuais do suporte.
    *   Se novos arquivos forem enviados, eles são adicionados.
    *   Se `filenames` forem fornecidos no DTO, o controller os utiliza para deletar os arquivos antigos do S3 antes de adicionar os novos.
*   **Remoção (`remove`):**
    *   Este é um *hard delete*.
    *   Antes de deletar o registro do banco de dados, ele busca o registro para obter a lista de arquivos associados.
    *   Itera sobre a lista de arquivos e os deleta do S3 para evitar que fiquem órfãos.
    *   Finalmente, remove o registro do banco de dados.
*   **Logging e Gerenciamento de Conexão:** Todas as operações de CUD são logadas, e o serviço gerencia a desconexão do Prisma no bloco `finally`.

## Endpoints da API (SuporteController)

Abaixo estão os endpoints expostos pelo `SuporteController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/suporte` | Cria um novo registro de suporte, com upload de até 5 arquivos. | Sim |
| `GET` | `/suporte/:id` | Busca todos os registros de suporte associados a um ID de solicitação. | Sim |
| `GET` | `/suporte/getone/:id` | Busca um registro de suporte específico pelo seu próprio ID. | Sim |
| `PATCH` | `/suporte/:id` | Atualiza um registro de suporte, permitindo a substituição de arquivos. | Sim |
| `DELETE` | `/suporte/:id` | Remove permanentemente um registro de suporte e seus arquivos associados. | Sim |
