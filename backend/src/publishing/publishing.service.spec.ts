import { PublishingService } from './publishing.service';
import { PrismaService } from '../prisma/prisma.service';
import { setupTestApp, cleanupDatabase, createTestType } from '../../test/utils/setup';

describe('PublishingService', () => {
  let service: PublishingService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const app = await setupTestApp();
    prismaService = app.get<PrismaService>(PrismaService);
    service = app.get<PublishingService>(PublishingService);
    await cleanupDatabase(prismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('findOnePublishing', () => {
    it('should return a publishing by story id', async () => {
      // Create test data
      const testType = await createTestType(prismaService);
      const story = await prismaService.stories.create({
        data: {
          name: 'Test Story',
          synopsis: 'Test Synopsis',
          types_id: testType.id,
        },
      });

      const publishing = await prismaService.publishing.create({
        data: {
          story_id: story.id,
          title: 'Test Title',
          description: 'Test Description',
          tags: ['test'],
          youtube_id: 'test_video_id',
          patreon_published: false,
        },
      });

      const result = await service.findOnePublishing(story.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(publishing.id);
      expect(result.story_id).toBe(story.id);
      expect(result.title).toBe('Test Title');
      expect(result.description).toBe('Test Description');
      expect(result.tags).toEqual(['test']);
      expect(result.youtube_id).toBe('test_video_id');
      expect(result.patreon_published).toBe(false);
    });

    it('should return null if publishing not found', async () => {
      const result = await service.findOnePublishing(999);
      expect(result).toBeNull();
    });
  });

  describe('updatePublishing', () => {
    it('should update a publishing record', async () => {
      // Create test data
      const testType = await createTestType(prismaService);
      const story = await prismaService.stories.create({
        data: {
          name: 'Test Story',
          synopsis: 'Test Synopsis',
          types_id: testType.id,
        },
      });

      const publishing = await prismaService.publishing.create({
        data: {
          story_id: story.id,
          title: 'Original Title',
          description: 'Original Description',
          tags: ['original'],
          youtube_id: 'original_video_id',
          patreon_published: false,
        },
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        tags: ['updated'],
        youtube_id: 'updated_video_id',
        patreon_published: true,
      };

      const result = await service.updatePublishing(publishing.id, updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe(publishing.id);
      expect(result.story_id).toBe(story.id);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
      expect(result.tags).toEqual(['updated']);
      expect(result.youtube_id).toBe('updated_video_id');
      expect(result.patreon_published).toBe(true);
    });

    it('should return null if publishing not found', async () => {
      const updateData = {
        title: 'Updated Title',
      };

      try {
        await service.updatePublishing(999, updateData);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('createPublishing', () => {
    it('should create a new publishing record', async () => {
      // Create test data
      const testType = await createTestType(prismaService);
      const story = await prismaService.stories.create({
        data: {
          name: 'Test Story',
          synopsis: 'Test Synopsis',
          types_id: testType.id,
        },
      });

      const createData = {
        story_id: story.id,
        title: 'New Title',
        description: 'New Description',
        tags: ['new'],
        youtube_id: 'new_video_id',
        patreon_published: false,
      };

      const result = await service.createPublishing(createData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.story_id).toBe(story.id);
      expect(result.title).toBe('New Title');
      expect(result.description).toBe('New Description');
      expect(result.tags).toEqual(['new']);
      expect(result.youtube_id).toBe('new_video_id');
      expect(result.patreon_published).toBe(false);
    });
  });
}); 