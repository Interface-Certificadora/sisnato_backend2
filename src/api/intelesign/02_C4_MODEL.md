# Arquitetura do Sistema com C4 Model

Este documento descreve a arquitetura do `sisnato_backend2` utilizando o modelo C4 para visualização de arquitetura de software. O modelo C4 é composto por 4 níveis de diagramas: Contexto, Contêineres, Componentes e Código.

Aqui, detalharemos os dois primeiros níveis.

## Nível 1: Diagrama de Contexto do Sistema

O Diagrama de Contexto (Nível 1) mostra a visão mais ampla do sistema. Ele apresenta o `sisnato_backend2` como uma "caixa preta" no centro e ilustra como ele interage com seus usuários e com outros sistemas externos.

### Atores

*   **Usuário do Sistema:** Representa os usuários internos (Administradores, Financeiras, Corretores) que interagem com o sistema através de uma aplicação front-end.
*   **Cliente Final (Signatário):** Pessoa que assina os documentos. Interage com o sistema indiretamente, recebendo e-mails com links para assinar os envelopes digitais.

### Sistemas Externos

*   **Sisnato Frontend (Aplicação Web):** A interface de usuário (SPA - Single Page Application) que consome a API do `sisnato_backend2` para todas as operações do sistema.
*   **IntelliSign API:** Serviço externo para criação, gerenciamento e monitoramento de envelopes de assinatura digital.
*   **AWS S3:** Serviço de armazenamento em nuvem usado para guardar documentos originais, assinados, relatórios (PDF/XLSX) e manifestos.
*   **Serviço de E-mail:** Plataforma externa responsável pelo envio de e-mails transacionais, como os links de assinatura para os clientes finais.
*   **Serviço de SMS:** Plataforma para envio de notificações e alertas via SMS para os usuários do sistema.
*   **RabbitMQ:** Sistema de mensageria para processamento assíncrono de tarefas, como a geração de relatórios complexos.
*   **Sistema Legado (FCweb):** Banco de dados MySQL legado, acessado para consulta de informações específicas.
*   **Gateway de Pagamento (EFI):** Serviço para processamento de pagamentos e cobranças.

### Diagrama (PlantUML)

```plantuml
@startuml C4_Context
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

title Diagrama de Contexto do Sistema - Sisnato Backend

Person(user, "Usuário do Sistema", "ADM, Financeira, Corretor")
Person_Ext(signer, "Cliente Final (Signatário)", "Assina os documentos digitalmente")

System(sisnato_frontend, "Sisnato Frontend", "Aplicação Web (SPA)")
System_Ext(email_service, "Serviço de E-mail", "Envia notificações e links de assinatura")
System_Ext(sms_service, "Serviço de SMS", "Envia alertas")
System_Ext(intelisign, "IntelliSign API", "API de Assinatura Digital")
System_Ext(s3, "AWS S3", "Armazenamento de Arquivos")
System_Ext(rabbitmq, "RabbitMQ", "Fila de Mensagens")
System_Ext(legacy_db, "Sistema Legado (FCweb)", "Banco de Dados MySQL")
System_Ext(payment_gateway, "Gateway de Pagamento (EFI)", "Processa pagamentos")

System(sisnato_backend, "Sisnato Backend", "NestJS API")

' Relacionamentos
Rel(user, sisnato_frontend, "Usa")
Rel(sisnato_frontend, sisnato_backend, "Faz chamadas à API", "HTTPS/JSON")

Rel(sisnato_backend, intelisign, "Gerencia envelopes de assinatura", "HTTPS/JSON")
Rel(sisnato_backend, s3, "Armazena e recupera arquivos", "HTTPS")
Rel(sisnato_backend, email_service, "Envia e-mails para", "SMTP/API")
Rel(sisnato_backend, sms_service, "Envia notificações", "API")
Rel(sisnato_backend, rabbitmq, "Publica tarefas assíncronas", "AMQP")
Rel(sisnato_backend, legacy_db, "Consulta dados", "SQL")
Rel(sisnato_backend, payment_gateway, "Processa cobranças", "HTTPS/JSON")

Rel(email_service, signer, "Envia link de assinatura")

@enduml
```

---

## Nível 2: Diagrama de Contêineres

O Diagrama de Contêineres (Nível 2) "dá um zoom" no `sisnato_backend2` para mostrar os principais blocos de construção (contêineres) que o compõem. Um contêiner, neste contexto, representa algo executável ou um armazenamento de dados, como uma aplicação ou um banco de dados.

### Contêineres

*   **API (Aplicação NestJS):** O coração do sistema. É uma aplicação monolítica que implementa toda a lógica de negócio, expõe a API REST para o front-end e se comunica com os demais contêineres e sistemas externos.
*   **Banco de Dados Principal (PostgreSQL):** Armazena todos os dados primários da aplicação, como usuários, solicitações, relatórios, registros de envelopes de assinatura, etc. É gerenciado pelo Prisma ORM.

### Diagrama (PlantUML)

```plantuml
@startuml C4_Container
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Diagrama de Contêineres - Sisnato Backend

' Atores e Sistemas Externos (do diagrama de contexto)
Person(user, "Usuário do Sistema", "ADM, Financeira, Corretor")
Person_Ext(signer, "Cliente Final (Signatário)")

System(sisnato_frontend, "Sisnato Frontend", "Aplicação Web (SPA)")
System_Ext(intelisign, "IntelliSign API", "API de Assinatura Digital")
System_Ext(s3, "AWS S3", "Armazenamento de Arquivos")
System_Ext(email_service, "Serviço de E-mail")
System_Ext(sms_service, "Serviço de SMS")
System_Ext(rabbitmq, "RabbitMQ", "Fila de Mensagens")
System_Ext(legacy_db, "Sistema Legado (FCweb)", "Banco de Dados MySQL")
System_Ext(payment_gateway, "Gateway de Pagamento (EFI)")

' Contêineres dentro do Sisnato Backend
System_Boundary(c1, "Sisnato Backend") {
    Container(api, "API", "TypeScript, NestJS", "Expõe a API REST, processa a lógica de negócio")
    ContainerDb(db, "Banco de Dados Principal", "PostgreSQL", "Armazena dados da aplicação (usuários, solicitações, etc.)")
}

' Relacionamentos
Rel(user, sisnato_frontend, "Usa")
Rel(sisnato_frontend, api, "Consome", "HTTPS/JSON")

Rel(api, db, "Lê e Escreve", "Prisma ORM")

Rel(api, intelisign, "Gerencia envelopes", "HTTPS/JSON")
Rel(api, s3, "Armazena e recupera arquivos", "AWS SDK")
Rel(api, email_service, "Envia e-mails", "SMTP/API")
Rel(api, sms_service, "Envia SMS", "API")
Rel(api, rabbitmq, "Publica/Consome mensagens", "AMQP")
Rel(api, legacy_db, "Consulta dados legados", "Sequelize")
Rel(api, payment_gateway, "Processa cobranças", "HTTPS/JSON")

Rel(email_service, signer, "Envia link de assinatura")

@enduml
```

## Próximos Passos (Nível 3 e 4)

*   **Nível 3 (Componentes):** Um próximo passo seria detalhar os principais componentes dentro do contêiner "API". Isso envolveria mostrar os módulos do NestJS (`IntelesignModule`, `AuthModule`, `RelatorioFinanceiroModule`, etc.) e como eles se relacionam.

*   **Nível 4 (Código):** Este nível mostra detalhes de implementação de um componente específico, como diagramas de classe ou de sequência, e geralmente é criado sob demanda para explicar partes complexas do código.

A documentação `TODO.md` e `01_VISAO_GERAL_E_ARQUITETURA.md` já indicam a intenção de seguir boas práticas, e a criação destes diagramas é um excelente passo para solidificar e comunicar a arquitetura do projeto.