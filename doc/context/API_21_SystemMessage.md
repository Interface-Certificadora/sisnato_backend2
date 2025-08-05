
# Módulo da API: System Message

**Arquivo:** `src/api/system_message/`

## Finalidade

O módulo `System Message` fornece uma interface de CRUD (Create, Read, Update, Delete) para gerenciar mensagens ou alertas globais do sistema. Essas mensagens podem ser usadas para exibir notificações, avisos ou informações importantes para todos os usuários da plataforma.

## Lógica de Negócio (SystemMessageService)

O `SystemMessageService` implementa a lógica de negócio para interagir com a tabela `SystemMessage` no banco de dados.

*   **Criação (`create`):** Salva uma nova mensagem no banco de dados.
*   **Busca (`findAll`, `findOne`):** Permite buscar todas as mensagens do sistema ou uma mensagem específica pelo seu ID.
*   **Atualização (`update`):** Atualiza o conteúdo ou o tipo de uma mensagem existente.
*   **Remoção (`remove`):** Exclui permanentemente (`hard delete`) uma mensagem do sistema do banco de dados.
*   **Logging:** O serviço utiliza um `Logger` para registrar quaisquer erros que ocorram durante as operações de banco de dados.

## Endpoints da API (SystemMessageController)

Abaixo estão os endpoints expostos pelo `SystemMessageController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/system-message` | Cria uma nova mensagem de sistema. | Sim |
| `GET` | `/system-message` | Lista todas as mensagens de sistema. | Sim |
| `GET` | `/system-message/:id` | Busca uma mensagem de sistema específica pelo seu ID. | Sim |
| `PATCH` | `/system-message/:id` | Atualiza uma mensagem de sistema. | Sim |
| `DELETE` | `/system-message/:id` | Remove permanentemente uma mensagem de sistema. | Sim |
