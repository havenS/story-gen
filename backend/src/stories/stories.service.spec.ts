import { INestApplication } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { PrismaService } from '../prisma/prisma.service';
import { setupTestApp, cleanupDatabase, createTestType } from '../../test/utils/setup';
import { StoryDto } from './dto/story.dto';

describe('StoriesService', () => {
  let service: StoriesService;
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    service = app.get<StoriesService>(StoriesService);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase(prismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFolderName', () => {
    it('should return the correct folder name format', () => {
      const story: Partial<StoryDto> = {
        name: 'Test Story Name!',
      };
      const result = service.getFolderName(story);
      expect(result).toBe('test-story-name');
    });
  });

  describe('findOne', () => {
    it('should return a story by id', async () => {
      // Create a test type first
      const type = await createTestType(prismaService);

      // Create a test story
      const story = await prismaService.stories.create({
        data: {
          name: 'Test Story',
          synopsis: 'Test Synopsis',
          types_id: type.id,
        },
      });

      const result = await service.findOne(story.id);
      expect(result.name).toEqual(story.name);
    });
  });
});
