// import './otel';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import { DiscordExceptionFilter } from './error/error.filter';
import { PrismaClientExceptionFilter } from './prisma/prisma.filter';

const port = process.env.PORT || 3000;
const ApiRoute = process.env.API_ROUTE || 'api';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Api sisnato')
    .setDescription('Documentação da api SisNato')
    .setVersion('2.0')
    .addServer(`http://localhost:${port}`, 'Servidor Local')
    .addServer(`https://apiv2.sisnato.com.br`, 'Servidor produção')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(ApiRoute, app, documentFactory, {
    swaggerOptions: {
      docExpansion: 'none', // Mantém todas as seções recolhidas por padrão
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Configuração CORS para produção
   * - Permite origens específicas via variável de ambiente ou todas em desenvolvimento
   * - Suporta credenciais (cookies, headers de autenticação)
   * - Configura headers permitidos e expostos adequadamente
   * - Habilita preflight caching para melhor performance
   */
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['*'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile apps, Postman, etc)
      if (!origin) {
        return callback(null, true);
      }

      // Se ALLOWED_ORIGINS não estiver definido, permite todas as origens
      if (allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Verifica se a origem está na lista de permitidas
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Bloqueia origens não autorizadas
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'Authorization',
      'X-Total-Count',
    ],
    credentials: true,
    maxAge: 86400, // 24 horas de cache para preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Configuração para arquivos grandes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalFilters(new DiscordExceptionFilter());

  await app.listen(port).then(() => {
    console.log(' ');
    console.log(` `);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Api running on http://localhost:${port}/${ApiRoute}`);
    console.log(` `);
  });
}
bootstrap();
