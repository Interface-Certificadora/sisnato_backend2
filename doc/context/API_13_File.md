
# Módulo da API: File

**Arquivo:** `src/api/file/`

## Finalidade

O módulo `File` atua como um gateway para o serviço de armazenamento de objetos (AWS S3). Ele gerencia o upload, download, visualização e exclusão de arquivos, organizando-os em "setores" predefinidos (`cnh`, `doc`, `chamado`, `suporte`, `sisnatodoc`). Além disso, ele também lida com a listagem de vídeos de um banco de dados.

## Lógica de Negócio (FileService e S3Service)

A lógica principal está dividida entre o `FileController` e o `S3Service` (que é injetado no controller).

*   **`FileController`:**
    *   **Validação de Setor:** O controller valida se o `setor` fornecido na URL é um dos setores permitidos.
    *   **Upload (`create`):** Recebe um arquivo via `multipart/form-data`, gera um novo nome para ele baseado no timestamp atual para evitar colisões, e chama o `S3Service` para realizar o upload. Retorna as URLs de visualização e download do arquivo recém-criado.
    *   **Listagem (`findAll`):** Busca no S3 todos os arquivos de um determinado setor e também busca no banco de dados (usando o `FileService`) uma lista de vídeos. Agrupa os resultados por tipo (pdf, doc, img, audio, video).
    *   **Visualização (`findView`):** Obtém uma URL pré-assinada do S3 para o arquivo e redireciona o cliente para essa URL, permitindo a visualização no navegador.
    *   **Download (`findDownload`):** Baixa o arquivo do S3 e o transmite diretamente na resposta HTTP com os cabeçalhos apropriados (`Content-Disposition: attachment`) para forçar o download.
    *   **Exclusão (`remove`):** Chama o `S3Service` para deletar o arquivo do bucket S3.
*   **`FileService`:**
    *   Este serviço é mais simples e sua principal função é interagir com a tabela `VideosFaq` no banco de dados para buscar registros de vídeos, seja todos ou apenas os que possuem a tag `faq`.

## Endpoints da API (FileController)

Abaixo estão os endpoints expostos pelo `FileController`.

| Método | Rota | Descrição | Protegido |
| :--- | :--- | :--- | :--- |
| `POST` | `/file/:setor` | Realiza o upload de um arquivo para o setor especificado. | Sim |
| `GET` | `/file/:setor` | Lista todos os arquivos de um setor e os vídeos do banco. | Não |
| `GET` | `/file/:setor/:filename` | Redireciona para a URL de visualização de um arquivo. | Não |
| `GET` | `/file/download/:setor/:filename` | Força o download de um arquivo. | Não |
| `DELETE` | `/file/:setor/:filename` | Deleta um arquivo do S3. | Sim |
| `GET` | `/file/sisnato/videos/faq` | Lista os vídeos da tabela `VideosFaq` com a tag 'faq'. | Não |
