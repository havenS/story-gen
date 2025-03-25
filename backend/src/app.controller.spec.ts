import { INestApplication } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { setupTestApp } from '../test/utils/setup';

describe('AppController', () => {
  let appController: AppController;
  let app: INestApplication;
  let appService: AppService;

  beforeAll(async () => {
    app = await setupTestApp();
    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.ping()).toBe('Hello World!');
    });
  });
});
