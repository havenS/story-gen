import { INestApplication } from '@nestjs/common';
import { PublishingController } from './publishing.controller';
import { PrismaService } from '../prisma/prisma.service';
import { setupTestApp, cleanupDatabase } from '../../test/utils/setup';

describe('PublishingController', () => {
  let controller: PublishingController;
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<PublishingController>(PublishingController);
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
