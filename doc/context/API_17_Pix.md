
# Módulo da API: Pix

**Arquivo:** `src/api/pix/`

## Finalidade

O módulo `Pix` é responsável por toda a interação com um provedor de serviços de pagamento (PSP) para gerar e consultar cobranças Pix. Ele utiliza a SDK `sdk-typescript-apis-efi` para se comunicar com a API da Efí Pay.

## Lógica de Negócio (PixService)

O `PixService` encapsula a lógica de comunicação com a API da Efí para operações Pix.

*   **Configuração:** O serviço é configurado para usar as credenciais de **sandbox** (ambiente de teste) da Efí, lendo `CLIENT_ID_SANDBOX`, `CLIENT_SECRET_SANDBOX` e o caminho para o certificado de segurança das variáveis de ambiente. A configuração de produção está comentada no código.
*   **Criação de Cobrança (`create`):**
    *   Recebe os dados do devedor (CPF, nome) e o valor da cobrança.
    *   Monta o corpo da requisição com um tempo de expiração de 3600 segundos (1 hora).
    *   Chama o método `pixCreateImmediateCharge` da SDK da Efí para criar a cobrança.
    *   Após criar a cobrança, chama o método `QrCodeEfi` para gerar o QR Code correspondente à cobrança recém-criada.
    *   Retorna um objeto combinado com os dados da cobrança e os dados do QR Code.
*   **Geração de QR Code (`QrCodeEfi`):** É um método auxiliar que, dado o ID de uma localização de cobrança, gera os dados da imagem do QR Code.
*   **Verificação de Status (`PixPaymentStatus`):** Dado um `txid` (ID da transação), este método consulta a API da Efí para obter os detalhes e o status atual de uma cobrança Pix.
*   **Error Handling:** Todas as funções fazem o log de erros usando um `ErrorService` injetado, garantindo que falhas na comunicação com a API da Efí sejam registradas.

## Endpoints da API (PixController)

Abaixo estão os endpoints expostos pelo `PixController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/pix` | Cria uma nova cobrança Pix imediata e retorna os dados com o QR Code. | Sim |
| `GET` | `/pix/verifique/:id` | Verifica o status de uma cobrança Pix usando o seu `txid`. | Sim |
