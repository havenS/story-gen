import { INestApplication } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { setupTestApp } from '../../test/utils/setup';

describe('StoriesController', () => {
  let controller: StoriesController;
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<StoriesController>(StoriesController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
