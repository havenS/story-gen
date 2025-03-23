import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { OpenApiNestFactory } from 'nest-openapi-tools';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const apiDocBuilder = new DocumentBuilder()
    .setTitle('Story Generator')
    .setDescription('The story generator API description')
    .setVersion('1.0');
  const config = apiDocBuilder.build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await OpenApiNestFactory.configure(app,
    apiDocBuilder,
    {
      webServerOptions: {
        enabled: true,
        path: 'api-docs',
      },
      fileGeneratorOptions: {
        enabled: true,
        outputFilePath: './openapi.json',
      },
      clientGeneratorOptions: {
        enabled: true,
        type: 'typescript-axios',
        outputFolderPath: '../frontend/src/services/api-client',
        additionalProperties:
          'apiPackage=clients,modelPackage=models,withoutPrefixEnums=true,withSeparateModelsAndApi=true',
        openApiFilePath: './openapi.json',
        skipValidation: true,
      },
    }, {
    operationIdFactory: (c: string, method: string) => method,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
