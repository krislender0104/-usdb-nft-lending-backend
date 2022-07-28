import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    '/doc',
    expressBasicAuth({
      challenge: true,
      users: {
        danny: 'secret',
      },
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'files'));
  const options = new DocumentBuilder()
    .setTitle('USDB NFT Lending/Borrowing Marketplace API Documentation')
    .setDescription(
      'This documentation is for USDB NFT Lending/Borrowing Marketplace',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  app.enableCors({ origin: '*' });
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);
  await app.listen(process.env.PORT || 3000);
}

bootstrap().then();
