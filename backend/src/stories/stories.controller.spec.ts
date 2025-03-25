import { INestApplication } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { setupTestApp } from '../../test/utils/setup';

describe('StoriesController', () => {
  let controller: StoriesController;
  let app: INestApplication;
  let storiesService: StoriesService;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<StoriesController>(StoriesController);
    storiesService = app.get<StoriesService>(StoriesService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
