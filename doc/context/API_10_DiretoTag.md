
# Módulo da API: Direto-Tag

**Arquivo:** `src/api/direto-tag/`

## Finalidade

O módulo `Direto-Tag` é responsável por associar tags a uma solicitação do tipo "Direto". Ele funciona como uma ponte entre a tabela `Direto` e a `TagList` (uma lista mestra de tags disponíveis), criando registros na tabela `DiretoTag`.

## Lógica de Negócio (DiretoTagService)

O `DiretoTagService` gerencia a lógica de criação e remoção de tags para as solicitações "Direto".

*   **Criação de Tags (`create`):**
    *   O serviço primeiro verifica se já existe um registro na tabela `Direto` para a `solicitacaoId` fornecida. Se não existir, ele cria um.
    *   Em seguida, ele busca a tag na tabela `TagList` para garantir que a tag que está sendo associada é válida.
    *   Finalmente, ele cria o registro na tabela `DiretoTag`, associando a `diretoId` com a `descricao` (label) da tag.
    *   A ação é devidamente logada com informações do usuário, da solicitação e da tag.
*   **Busca de Tags (`findAll`, `findOne`, `findDiretoAll`):** Fornece métodos para buscar todas as tags, uma tag específica por seu ID, ou todas as tags associadas a uma `solicitacaoId` específica.
*   **Remoção de Tags (`remove`):**
    *   Encontra a tag a ser removida e, em seguida, a deleta do banco de dados.
    *   Busca as informações do cliente (solicitação) associado para registrar um log detalhado da remoção.

## Endpoints da API (DiretoTagController)

Abaixo estão os endpoints expostos pelo `DiretoTagController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/direto-tag` | Cria e associa uma nova tag a uma solicitação "Direto". | Sim |
| `GET` | `/direto-tag` | Retorna todas as associações de tags "Direto" existentes. | Sim |
| `GET` | `/direto-tag/:id` | Busca uma associação de tag específica pelo seu ID. | Sim |
| `GET` | `/direto-tag/direto/:id` | Retorna todas as tags associadas a um ID de solicitação "Direto". | Sim |
| `DELETE` | `/direto-tag/:id` | Remove uma associação de tag pelo seu ID. | Sim |
