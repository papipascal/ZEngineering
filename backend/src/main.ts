import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — support multiple origins (comma-separated) or wildcard
  const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:3001';
  const origins = corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim());
  app.enableCors({ origin: origins, credentials: true });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Zen-gineering API')
    .setDescription('Collaborative industrial project management API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`Zen-gineering API running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
