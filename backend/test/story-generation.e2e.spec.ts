import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  TestContext,
  setupTestApp,
  cleanupDatabase,
  createTestType,
} from './utils/setup';
import {
  expectedStoryResponse,
  expectedMediaResponse,
} from './fixtures/story.fixture';

describe('Story Generation Flow (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let typeId: number;

  beforeAll(async () => {
    context = await setupTestApp();
    app = context.app;
  });

  beforeEach(async () => {
    await cleanupDatabase(context.prismaService);
    const type = await createTestType(context.prismaService);
    typeId = type.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a story and generate all required content', async () => {
    // Verify test type exists
    console.error(typeId);
    const typeResponse = await request(app.getHttpServer())
      .get(`/types/${typeId}`)
      .expect(200);

    expect(typeResponse.body).toBeDefined();
    expect(typeResponse.body.id).toBe(typeId);

    // Create story
    const createResponse = await request(app.getHttpServer())
      .post('/stories')
      .send({ types_id: typeId })
      .expect(201);

    expect(createResponse.body).toBeDefined();
    expect(createResponse.body.name).toBe(expectedStoryResponse.name);
    expect(createResponse.body.synopsis).toBe(expectedStoryResponse.synopsis);
    expect(createResponse.body.chapters).toHaveLength(3);

    // Generate content
    const contentResponse = await request(app.getHttpServer())
      .post(`/stories/${createResponse.body.id}/generate-content`)
      .expect(200);

    expect(contentResponse.body).toBeDefined();
    expect(contentResponse.body.chapters).toHaveLength(3);
    contentResponse.body.chapters.forEach((chapter: any, index: number) => {
      expect(chapter.title).toBe(expectedStoryResponse.chapters[index].title);
      expect(chapter.summary).toBe(
        expectedStoryResponse.chapters[index].summary,
      );
      expect(chapter.content).toBe(
        expectedStoryResponse.chapters[index].content,
      );
    });

    // Generate media
    const mediaResponse = await request(app.getHttpServer())
      .post(`/stories/${createResponse.body.id}/generate-media`)
      .expect(200);

    expect(mediaResponse.body).toBeDefined();
    expect(mediaResponse.body.videoUrl).toBe(expectedMediaResponse.videoUrl);
    expect(mediaResponse.body.audioUrl).toBe(expectedMediaResponse.audioUrl);
    expect(mediaResponse.body.thumbnailUrl).toBe(
      expectedMediaResponse.thumbnailUrl,
    );
    expect(mediaResponse.body.chapters).toHaveLength(3);
    mediaResponse.body.chapters.forEach((chapter: any, index: number) => {
      expect(chapter.videoUrl).toBe(
        expectedMediaResponse.chapters[index].videoUrl,
      );
      expect(chapter.audioUrl).toBe(
        expectedMediaResponse.chapters[index].audioUrl,
      );
    });
  });

  // it('should handle errors during content generation', async () => {
  //   // Mock generateChapterContent to throw an error
  //   context.llmService.generateChapterContent = jest.fn().mockRejectedValue(new Error('Content generation failed'));

  //   const createResponse = await request(app.getHttpServer())
  //     .post('/stories')
  //     .send({ types_id: typeId })
  //     .expect(201);

  //   await request(app.getHttpServer())
  //     .post(`/stories/${createResponse.body.id}/generate-content`)
  //     .expect(500);
  // });

  // it('should handle errors during media generation', async () => {
  //   // Mock generateStoryMedia to throw an error
  //   context.genApiService.generateStoryMedia = jest.fn().mockRejectedValue(new Error('Media generation failed'));

  //   const createResponse = await request(app.getHttpServer())
  //     .post('/stories')
  //     .send({ types_id: typeId })
  //     .expect(201);

  //   await request(app.getHttpServer())
  //     .post(`/stories/${createResponse.body.id}/generate-media`)
  //     .expect(500);
  // });
});
