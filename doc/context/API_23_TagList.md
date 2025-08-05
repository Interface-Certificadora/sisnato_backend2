
# Módulo da API: Tag-List

**Arquivo:** `src/api/tag-list/`

## Finalidade

O módulo `Tag-List` gerencia a lista mestra de tags disponíveis no sistema. Ele fornece uma fonte centralizada de tags que podem ser usadas em outros módulos, como o `Tag` e o `Direto-Tag`, garantindo consistência e evitando a criação de tags duplicadas ou com erros de digitação.

## Lógica de Negócio (TagListService)

O `TagListService` implementa a lógica de CRUD para a tabela `TagList`.

*   **Criação (`create`):** Adiciona uma nova tag (um `label`) à lista mestra.
*   **Busca (`findAll`):** Retorna todas as tags disponíveis na lista mestra. Este endpoint notavelmente não requer autenticação, sugerindo que a lista de tags pode ser pública ou usada em contextos não autenticados.
*   **Remoção (`remove`):** Exclui permanentemente (`hard delete`) uma tag da lista mestra. Esta é uma operação destrutiva e deve ser usada com cuidado, pois pode afetar os locais onde a tag estava sendo usada.

## Endpoints da API (TagListController)

Abaixo estão os endpoints expostos pelo `TagListController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/tag-list` | Cria uma nova tag na lista mestra. | Sim |
| `GET` | `/tag-list` | Retorna todas as tags da lista mestra. | Não |
| `DELETE` | `/tag-list/:id` | Remove permanentemente uma tag da lista mestra. | Sim |
