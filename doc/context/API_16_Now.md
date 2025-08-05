
# Módulo da API: Now

**Arquivo:** `src/api/now/`

## Finalidade

O módulo `Now` é um recurso muito específico para gerenciar um status de alerta especial em uma `Solicitacao`, controlado pelo campo booleano `alertanow`. Ele permite consultar e, principalmente, ativar esse alerta para uma solicitação existente.

## Lógica de Negócio (NowService)

O `NowService` contém a lógica para interagir com o status `alertanow`.

*   **Consulta (`findOne`):** Busca o estado atual do campo `alertanow` para uma determinada `Solicitacao` pelo seu ID.
*   **Atualização (`update`):** Este é o método principal. Ele ativa o `alertanow` para uma solicitação. Antes de fazer a atualização, ele realiza uma verificação de pré-condição: a solicitação deve ter um documento de CNH ou RG (`uploadCnh` ou `uploadRg`) enviado. Se nenhum documento estiver presente, ele lança uma exceção. Se a condição for atendida, ele atualiza o campo `alertanow`, define a data de criação do alerta (`dt_criacao_now`) e também atualiza o `createdAt` da solicitação para a data atual, o que pode ser um efeito colateral inesperado. A ação é registrada no log.
*   **Gerenciamento de Conexão:** O serviço gerencia explicitamente a desconexão do Prisma no bloco `finally`.

## Endpoints da API (NowController)

Abaixo estão os endpoints expostos pelo `NowController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `GET` | `/now/:id` | Consulta o status do `alertanow` de uma solicitação. | Sim |
| `PATCH` | `/now/:id` | Ativa o `alertanow` para uma solicitação, se as condições forem atendidas. | Sim |
