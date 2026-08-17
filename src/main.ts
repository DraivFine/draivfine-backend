import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  const port = process.env.PORT ?? 3000;
  // Le préfixe ne doit PAS inclure "v1" : app.enableVersioning() l'ajoute déjà
  // (chaque contrôleur déclare version: '1'), sinon les routes finissent en
  // /api/v1/v1/... .
  const apiPrefix = process.env.API_PREFIX ?? 'api';

  app.use(helmet());
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI });

  // Photos de profil uploadées via /utilisateurs/:id/photo — servies hors
  // préfixe/versioning API (fichiers statiques, pas des routes REST).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DraivFine API')
    .setDescription(
      "API de la plateforme de scoring comportemental des conducteurs (DraivFine) : trajets, ingestion de données capteurs, scoring (ML + heuristiques), alertes et bouton d'urgence, abonnements et paiement mobile money.",
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API démarrée sur http://localhost:${port}/${apiPrefix}/v1`);
  // eslint-disable-next-line no-console
  console.log(`Documentation Swagger sur http://localhost:${port}/docs`);
}
bootstrap();
