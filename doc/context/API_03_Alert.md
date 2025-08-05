
# Módulo da API: Alert

**Arquivo:** `src/api/alert/`

## Finalidade

O módulo `Alert` é responsável por gerenciar os alertas do sistema. Os alertas podem ser associados a solicitações específicas e a corretores, servindo como um sistema de notificação interna. Ele também se integra com um serviço de SMS para enviar notificações.

## Lógica de Negócio (AlertService)

O `AlertService` contém a lógica principal para manipular os alertas. Suas responsabilidades incluem:

*   **Criação de Alertas:** Ao criar um alerta, o serviço registra a informação no banco de dados e, se um corretor estiver associado, envia uma notificação por SMS.
*   **Controle de Acesso:** A lógica de acesso é baseada na hierarquia e nas permissões (`role`) do usuário. Um usuário com hierarquia de `ADM` tem acesso a todos os alertas, enquanto outros usuários só podem ver os alertas que lhes foram designados.
*   **Busca de Alertas:** Permite buscar todos os alertas, contar os alertas em aberto para um usuário, buscar um alerta específico por ID e buscar todos os alertas associados a uma `Solicitacao`.
*   **Atualização e Remoção:** Permite a atualização dos dados de um alerta e a sua "remoção" (que na verdade é uma desativação, setando `status` para `false`).
*   **Logging:** Todas as ações importantes (criação, atualização, remoção) são registradas usando o `LogService`.

## Endpoints da API (AlertController)

Abaixo estão os endpoints expostos pelo `AlertController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/alert` | Cria um novo alerta. | Sim |
| `GET` | `/alert` | Retorna todos os alertas visíveis para o usuário logado. | Sim |
| `GET` | `/alert/cont` | Retorna a contagem de alertas ativos para o usuário. | Sim |
| `GET` | `/alert/:id` | Busca um alerta específico pelo seu ID. | Sim |
| `GET` | `/alert/get/cadastro/:id` | Retorna todos os alertas associados a um ID de solicitação. | Sim |
| `PUT` | `/alert/update/:id` | Atualiza um alerta existente. | Sim |
| `DELETE` | `/alert/delete/:id` | Desativa um alerta (acessível apenas por `ADM`). | Sim |
