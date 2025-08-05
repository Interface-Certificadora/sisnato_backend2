
# Módulo da API: Checktel

**Arquivo:** `src/api/checktel/`

## Finalidade

O módulo `Checktel` tem uma única e específica função: verificar se um número de telefone possui uma conta de WhatsApp válida. Ele atua como um proxy, encaminhando a requisição para um serviço externo de verificação de números do WhatsApp.

## Lógica de Negócio (ChecktelService)

O `ChecktelService` contém a lógica para se comunicar com a API externa de verificação.

*   **Verificação de Telefone:** O método `getTell` recebe um número de telefone, formata-o para o padrão `55{telefone}` e faz uma requisição `POST` para a URL definida na variável de ambiente `WHATSAPP_URL`.
*   **Autenticação:** A requisição para o serviço externo é autenticada usando um `access-token` que também é lido das variáveis de ambiente (`WHATSAPP_KEY`).
*   **Resposta:** O serviço analisa a resposta da API externa. Se o status da resposta for diferente de `INVALID_WA_NUMBER`, ele retorna `{ exists: true }`. Caso contrário, retorna `{ exists: false }`.

## Endpoints da API (ChecktelController)

Abaixo está o único endpoint exposto pelo `ChecktelController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `GET` | `/checktel/:tell` | Verifica se um número de telefone (`tell`) tem uma conta de WhatsApp válida. | Sim |
