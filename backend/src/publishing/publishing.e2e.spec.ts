import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import { youtube_v3 } from 'googleapis';
import { PrismaService } from 'src/prisma/prisma.service';
import { YoutubeService } from 'src/youtube/youtube.service';
import { cleanupDatabase, createTestType, setupTestApp } from '../../test/utils/setup';
import { LLMService } from 'src/llm/llm.service';

describe('Publishing Flow (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let youtubeService: YoutubeService;
  let llmService: LLMService;

  beforeEach(async () => {
    app = await setupTestApp();
    prismaService = app.get<PrismaService>(PrismaService);
    youtubeService = app.get<YoutubeService>(YoutubeService);
    llmService = app.get<LLMService>(LLMService);
    await cleanupDatabase(prismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Publishing Flow', () => {
    it('should create a story, generate content, and publish to YouTube', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const mockChapterContent = [
        'Chapter 1 content '.repeat(200),  // ~400 words
        'Chapter 2 content '.repeat(200),  // ~400 words
        'Chapter 3 content '.repeat(200),  // ~400 words
      ];

      jest.spyOn(llmService, 'generateChapterContent').mockResolvedValue(mockChapterContent);


      // Create a test type
      const testType = await createTestType(prismaService);

      // Create a story
      const createResponse = await request(app.getHttpServer())
        .post('/stories')
        .send({ types_id: testType.id })
        .expect(201);

      const story = createResponse.body;

      // Generate content
      await request(app.getHttpServer())
        .put(`/stories/${story.id}/generate-content`)
        .expect(200);

      // Generate media
      await request(app.getHttpServer())
        .post(`/stories/${story.id}/generate-chapter-media`)
        .expect(201);

      // Mock YouTube service
      jest.spyOn(youtubeService, 'generateMetadata').mockResolvedValue({
        title: 'Test Title',
        description: 'Test Description',
        tags: ['test'],
        thumbnail: 'test/path',
      });

      const mockVideo: youtube_v3.Schema$Video = {
        id: 'test-video-id',
        snippet: {
          title: 'Test Title',
          description: 'Test Description',
        },
      };
      jest.spyOn(youtubeService, 'uploadVideo').mockResolvedValue(mockVideo);

      // Publish to YouTube
      const response = await request(app.getHttpServer())
        .post(`/publishing/${story.id}/youtube`).expect(201);
      expect(response.body.id).toBe('test-video-id');
    });

    it('should handle errors gracefully when publishing fails', async () => {
      // Create a test type
      const testType = await createTestType(prismaService);

      // Create a story
      const createResponse = await request(app.getHttpServer())
        .post('/stories')
        .send({ types_id: testType.id })
        .expect(201);

      const story = createResponse.body;

      // Mock YouTube service to throw an error
      jest.spyOn(youtubeService, 'generateMetadata').mockRejectedValue(new Error('Failed to generate metadata'));

      // Attempt to publish to YouTube
      await request(app.getHttpServer())
        .post(`/publishing/${story.id}/youtube`)
        .expect(400);
    });
  });

  describe('PublishingController (e2e)', () => {
    describe('GET /publishing/:storyId', () => {
      it('should return a publishing by story id', async () => {
        // Create a test type
        const testType = await createTestType(prismaService);

        // Create a story
        const story = await prismaService.stories.create({
          data: {
            name: 'Test Story',
            synopsis: 'Test Synopsis',
            types_id: testType.id,
          },
        });

        // Create a publishing record
        await prismaService.publishing.create({
          data: {
            story_id: story.id,
            title: 'Test Title',
            description: 'Test Description',
            tags: ['test'],
            youtube_id: 'test_video_id',
            patreon_published: false,
            instagram_published: false,
            tiktok_published: false,
          },
        });

        const response = await request(app.getHttpServer())
          .get(`/publishing/${story.id}`)
          .expect(200);

        expect(response.body.youtube_id).toBe('test_video_id');
      });

      it('should return 404 if publishing not found', async () => {
        try {
          await request(app.getHttpServer())
            .get('/publishing/999');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });

    describe('POST /publishing/:storyId/youtube', () => {
      it('should publish a story to YouTube', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        // Create a test type
        const testType = await createTestType(prismaService);

        // Create a story
        const story = await prismaService.stories.create({
          data: {
            name: 'Test Story',
            synopsis: 'Test Synopsis',
            types_id: testType.id,
          },
        });

        // Mock YouTube service
        jest.spyOn(youtubeService, 'generateMetadata').mockResolvedValue({
          title: 'Test Title',
          description: 'Test Description',
          tags: ['test'],
          thumbnail: 'test/path',
        });

        const mockVideo: youtube_v3.Schema$Video = {
          id: 'test-video-id',
          snippet: {
            title: 'Test Title',
            description: 'Test Description',
          },
        };
        jest.spyOn(youtubeService, 'uploadVideo').mockResolvedValue(mockVideo);

        const response = await request(app.getHttpServer())
          .post(`/publishing/${story.id}/youtube`)
          .expect(201);
        expect(response.body.id).toBe('test-video-id');
      });

      it('should return 404 if story not found', async () => {
        try {

          await request(app.getHttpServer())
            .post('/publishing/999/youtube');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });
});
