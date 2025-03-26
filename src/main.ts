import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const port = process.env.PORT || 3000;
const ApiRoute = process.env.API_ROUTE || 'api';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Api sisnato')
    .setDescription('Documentação da api SisNato')
    .setVersion('2.0')
    .addServer(`http://localhost:${port}`, 'Servidor Local')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(ApiRoute, app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port).then(() => {
    console.log('');
    console.log(` `);
    console.log(` `);
    console.log(` `);
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Api running on http://localhost:${port}/${ApiRoute}/`);
    console.log(` `);
  });
}
bootstrap();
