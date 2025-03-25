import { INestApplication } from '@nestjs/common';
import { PublishingController } from './publishing.controller';
import { PublishingService } from './publishing.service';
import { StoriesService } from '../stories/stories.service';
import { YoutubeService } from '../youtube/youtube.service';
import { PrismaService } from '../prisma/prisma.service';
import { setupTestApp, cleanupDatabase, createTestType } from '../../test/utils/setup';

describe('PublishingController', () => {
  let controller: PublishingController;
  let app: INestApplication;
  let publishingService: PublishingService;
  let storiesService: StoriesService;
  let youtubeService: YoutubeService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<PublishingController>(PublishingController);
    publishingService = app.get<PublishingService>(PublishingService);
    storiesService = app.get<StoriesService>(StoriesService);
    youtubeService = app.get<YoutubeService>(YoutubeService);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase(prismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
