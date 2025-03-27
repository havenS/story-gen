import { INestApplication } from '@nestjs/common';
import { AppController } from './app.controller';
import { setupTestApp } from '../test/utils/setup';

describe('AppController', () => {
  let appController: AppController;
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    appController = app.get<AppController>(AppController);
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
