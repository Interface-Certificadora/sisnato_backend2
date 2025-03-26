import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Sis Nato Api')
    .setDescription('Api de integração com o Sis Nato')
    .setVersion('1.0')
    .addTag('Rotas')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(3000, () => {
    console.log(` `);
    console.log(` `);
    console.log(` `);
    console.log(`Nest running on http://localhost:${3000}`);
    console.log(` `);
  });
}
bootstrap();
