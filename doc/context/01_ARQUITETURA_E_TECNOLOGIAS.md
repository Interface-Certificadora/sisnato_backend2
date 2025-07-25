# Arquitetura e Tecnologias - SISNATO Backend 2

## Visão Geral
O SISNATO Backend 2 é uma aplicação backend desenvolvida em Node.js utilizando o framework NestJS, seguindo os princípios de Clean Architecture, DDD (Domain-Driven Design) e SOLID.

## Stack Tecnológica

### Framework Principal
- **NestJS** (v11.0.13) - Framework Node.js para construção de aplicações server-side escaláveis
- **Node.js** - Runtime JavaScript

### Banco de Dados
- **MySQL** (mysql2 v3.14.0) - Banco de dados relacional principal
- **Prisma** (v6.5.0) - ORM moderno para TypeScript/JavaScript
- **@prisma/client** (v6.5.0) - Cliente Prisma para acesso ao banco

### Autenticação e Segurança
- **@nestjs/passport** (v11.0.5) - Integração com Passport.js
- **@nestjs/jwt** (v11.0.0) - Suporte a JSON Web Tokens
- **passport** (v0.7.0) - Middleware de autenticação
- **passport-jwt** (v4.0.1) - Estratégia JWT para Passport
- **bcrypt** (v5.1.1) - Hashing de senhas

### Documentação da API
- **@nestjs/swagger** (v11.1.0) - Geração automática de documentação OpenAPI/Swagger

### Validação e Transformação
- **class-validator** (v0.14.1) - Validação baseada em decorators
- **class-transformer** (v0.5.1) - Transformação de objetos

### Integração com AWS
- **@aws-sdk/client-s3** (v3.779.0) - Cliente S3 da AWS SDK v3
- **@aws-sdk/s3-request-presigner** (v3.779.0) - Geração de URLs pré-assinadas para S3
- **aws-sdk** (v2.1692.0) - AWS SDK v2 (legacy)

### Mensageria
- **@nestjs/microservices** (v11.1.0) - Suporte a microserviços no NestJS
- **amqp-connection-manager** (v4.1.14) - Gerenciamento de conexões AMQP
- **amqplib** (v0.10.8) - Cliente AMQP para Node.js

### Geração de Documentos
- **exceljs** (v4.4.0) - Geração de planilhas Excel
- **pdfmake** (v0.2.18) - Geração de documentos PDF

### Integração com APIs Externas
- **sdk-typescript-apis-efi** (v1.2.6) - SDK para integração com APIs EFI

### Utilitários
- **mime-types** (v2.1.35) - Detecção de tipos MIME
- **reflect-metadata** (v0.2.0) - Suporte a metadados para decorators
- **rxjs** (v7.8.1) - Programação reativa

### Desenvolvimento e Testes
- **TypeScript** - Linguagem principal
- **Jest** - Framework de testes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

## Arquitetura

### Padrões Utilizados
- **Clean Architecture** - Separação clara de responsabilidades em camadas
- **Domain-Driven Design (DDD)** - Modelagem baseada no domínio do negócio
- **SOLID** - Princípios de design orientado a objetos
- **Simple Factory** - Padrão de criação de objetos

### Estrutura de Camadas
1. **Presentation Layer** - Controllers e DTOs
2. **Application Layer** - Services e Use Cases
3. **Domain Layer** - Entities e Domain Services
4. **Infrastructure Layer** - Repositories e External Services

### Características Técnicas
- **ORM**: Prisma para mapeamento objeto-relacional
- **Autenticação**: JWT com Passport.js
- **Documentação**: Swagger/OpenAPI automática
- **Validação**: Class-validator com decorators
- **Armazenamento**: AWS S3 para arquivos
- **Mensageria**: AMQP para comunicação assíncrona
- **Testes**: Jest com cobertura de código

## Configuração do Ambiente
- **Desenvolvimento**: `npm run start:dev`
- **Produção**: `npm run start:prod`
- **Testes**: `npm run test`
- **Build**: `npm run build`

## Observações
- Projeto configurado com Docker e Docker Compose
- Suporte a TypeScript nativo
- Integração com AWS para armazenamento de arquivos
- Sistema de mensageria para processamento assíncrono
- Geração de relatórios em Excel e PDF
