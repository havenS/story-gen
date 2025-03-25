import * as request from 'supertest';
import {
  TestContext,
  setupTestApp,
  cleanupDatabase,
  createTestType,
} from './utils/setup';
import { testTypeData } from './fixtures/story.fixture';

describe('TypesController (e2e)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  });

  afterAll(async () => {
    await cleanupDatabase(ctx.prismaService);
    await ctx.app.close();
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await ctx.prismaService.publishing.deleteMany();
    await ctx.prismaService.chapters.deleteMany();
    await ctx.prismaService.stories.deleteMany();
    await ctx.prismaService.types.deleteMany();
  });

  describe('GET /types', () => {
    it('should return all types', async () => {
      // Create a test type
      const testType = await createTestType(ctx.prismaService);

      // Make the request
      const response = await request(ctx.app.getHttpServer())
        .get('/types')
        .expect(200);

      // Verify the response
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: testType.id,
        name: testTypeData.name,
        story_prompt: testTypeData.story_prompt,
        chapter_prompt: testTypeData.chapter_prompt,
        image_prompt: testTypeData.image_prompt,
        sound_prompt: testTypeData.sound_prompt,
        youtube_channel_id: testTypeData.youtube_channel_id,
        youtube_playlist_id: testTypeData.youtube_playlist_id,
      });
    });
  });

  describe('GET /types/:id/stories', () => {
    it('should return stories for a valid type ID', async () => {
      // Create a test type
      const testType = await createTestType(ctx.prismaService);

      // Make the request
      const response = await request(ctx.app.getHttpServer())
        .get(`/types/${testType.id}/stories`)
        .expect(200);

      // Verify the response
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0); // Initially empty since we haven't created any stories
    });

    it('should return 404 for a non-existent type ID', async () => {
      // Make the request with a non-existent ID
      await request(ctx.app.getHttpServer())
        .get('/types/999/stories')
        .expect(404);
    });
  });
});
