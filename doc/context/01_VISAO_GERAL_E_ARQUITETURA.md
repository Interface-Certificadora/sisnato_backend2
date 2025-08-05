
# Visão Geral e Arquitetura do Projeto sisnato_backend2

## 1. Propósito da Aplicação

O `sisnato_backend2` é o sistema de back-end para a plataforma Sisnato. Ele gerencia toda a lógica de negócios, acesso a dados e integrações com serviços de terceiros. As principais funcionalidades incluem:

*   **Gerenciamento de Entidades:** Controle de Construtoras, Empreendimentos, Financeiras e Usuários.
*   **Fluxo de Solicitações:** Processamento de solicitações de clientes, desde a criação até a aprovação e agendamento.
*   **Autenticação e Autorização:** Controle de acesso seguro para diferentes perfis de usuários.
*   **Comunicação:** Envio de alertas, notificações por SMS e chamados de suporte.
*   **Relatórios:** Geração de relatórios financeiros e operacionais.
*   **Integrações:** Conexão com serviços como AWS S3 para armazenamento de arquivos, RabbitMQ para mensageria e um sistema de Sequelize para interações legadas.

## 2. Stack Tecnológica

O projeto é construído sobre uma stack moderna de TypeScript:

*   **Framework Principal:** [NestJS](https://nestjs.com/) (versão 11), um framework Node.js para construir aplicações de servidor eficientes e escaláveis.
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (versão 5.1.3).
*   **Banco de Dados Primário:** [PostgreSQL](https://www.postgresql.org/).
*   **ORM (Object-Relational Mapping):** [Prisma](https://www.prisma.io/) (versão 6.5.0) é o ORM principal para interagir com o banco de dados PostgreSQL.
*   **Banco de Dados Secundário:** [MySQL](https://www.mysql.com/) (via `mysql2` e `sequelize`), provavelmente para integração com sistemas legados.
*   **Conteinerização:** [Docker](https://www.docker.com/), para criar um ambiente de desenvolvimento e produção consistente.
*   **Mensageria:** [RabbitMQ](https://www.rabbitmq.com/) (via `amqplib`), para comunicação assíncrona entre serviços.
*   **Armazenamento de Arquivos:** [AWS S3](https://aws.amazon.com/s3/), para upload e gerenciamento de arquivos.
*   **Testes:** [Jest](https://jestjs.io/), para testes unitários e de ponta a ponta (e2e).
*   **Linting e Formatação:** [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/), para manter a qualidade e a consistência do código.

## 3. Arquitetura e Padrões de Projeto

O projeto segue a arquitetura modular e os padrões de projeto promovidos pelo NestJS.

*   **Arquitetura Modular:** O código é organizado em **Módulos**, onde cada módulo encapsula um domínio de negócio específico (ex: `UserModule`, `SolicitacaoModule`). Isso promove a separação de responsabilidades e facilita a manutenção. O arquivo `src/app.module.ts` atua como o módulo raiz, importando todos os outros módulos da aplicação.

*   **Injeção de Dependência (DI):** O NestJS utiliza DI extensivamente. **Services** (serviços) que contêm a lógica de negócio são injetados em **Controllers** (controladores), que por sua vez lidam com as requisições HTTP. Isso desacopla os componentes e melhora a testabilidade.

*   **Padrão de Repositório (implícito pelo Prisma):** O `PrismaService` atua como uma camada de abstração para o banco de dados, seguindo o padrão de repositório. Ele é injetado nos serviços que precisam acessar os dados, centralizando a lógica de acesso ao banco.

*   **DTOs (Data Transfer Objects):** Para validar e tipar os dados que entram e saem da API, o projeto utiliza classes de DTO em conjunto com `class-validator` e `class-transformer`.

## 4. Estrutura de Pastas

A estrutura de pastas do projeto é a seguinte:

*   `prisma/`: Contém o schema do banco de dados (`schema.prisma`) e os arquivos de migração.
*   `src/`: É o diretório principal do código-fonte.
    *   `src/api/`: Contém os módulos de cada recurso da API (ex: `user`, `solicitacao`).
        *   `*.module.ts`: Define o módulo.
        *   `*.controller.ts`: Lida com as rotas e requisições HTTP.
        *   `*.service.ts`: Contém a lógica de negócio.
        *   `dto/`: Contém os Data Transfer Objects.
        *   `entities/`: Contém as entidades (embora o Prisma gere as suas próprias).
    *   `src/auth/`: Módulo de autenticação e autorização.
    *   `src/prisma/`: Módulo de configuração e serviço do Prisma.
    *   `src/s3/`: Módulo para integração com o AWS S3.
    *   `src/rabbitnq/`: Módulo para integração com o RabbitMQ.
*   `test/`: Contém os testes de ponta a ponta (e2e).
*   `doc/`: Pasta para a documentação.

