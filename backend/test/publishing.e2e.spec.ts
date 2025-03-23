import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { LLMService } from '../src/llm/llm.service';
import { GenApiService } from '../src/gen_api/gen_api.service';
import { YoutubeService } from '../src/youtube/youtube.service';

describe('Publishing Flow (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let llmService: LLMService;
  let genApiService: GenApiService;
  let youtubeService: YoutubeService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LLMService)
      .useValue({
        generateStoryInfo: jest.fn().mockResolvedValue({
          title: 'Test Story',
          synopsis: 'Test Synopsis',
          chapterOneTitle: 'Chapter 1',
          chapterOneSummary: 'Summary 1',
          chapterTwoTitle: 'Chapter 2',
          chapterTwoSummary: 'Summary 2',
          chapterThreeTitle: 'Chapter 3',
          chapterThreeSummary: 'Summary 3'
        }),
        generateStoryImagePrompt: jest.fn().mockResolvedValue('test image prompt'),
        generateChapterContent: jest.fn().mockResolvedValue(['Content 1', 'Content 2', 'Content 3']),
        getChapterBackgroundSound: jest.fn().mockResolvedValue({ background_sound: 'test sound' }),
        generateYouTubeMetadata: jest.fn().mockResolvedValue({
          title: 'Test YouTube Title',
          description: 'Test YouTube Description',
          tags: ['tag1', 'tag2']
        })
      })
      .overrideProvider(GenApiService)
      .useValue({
        generateChapterMedia: jest.fn().mockResolvedValue({
          audioFileName: 'test_audio.mp3',
          videoFileName: 'test_video.mp4',
        }),
        generateStoryMedia: jest.fn().mockResolvedValue({
          audioFileName: 'test_audio.mp3',
          videoFileName: 'test_video.mp4',
          thumbnailFileName: 'test_thumbnail.jpg',
        }),
        generateImage: jest.fn().mockResolvedValue('test_image.jpg'),
      })
      .overrideProvider(YoutubeService)
      .useValue({
        uploadVideo: jest.fn().mockResolvedValue('test_youtube_url'),
        generateMetadata: jest.fn().mockResolvedValue({
          title: 'Test YouTube Title',
          description: 'Test YouTube Description',
          tags: ['tag1', 'tag2'],
          thumbnail: 'test_thumbnail.jpg'
        })
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    llmService = moduleFixture.get<LLMService>(LLMService);
    genApiService = moduleFixture.get<GenApiService>(GenApiService);
    youtubeService = moduleFixture.get<YoutubeService>(YoutubeService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prismaService.$transaction([
      prismaService.publishing.deleteMany(),
      prismaService.chapters.deleteMany(),
      prismaService.stories.deleteMany(),
      prismaService.types.deleteMany(),
    ]);
  });

  describe('Complete Publishing Flow', () => {
    it('should create a story, generate content, and publish to YouTube', async () => {
      // 1. Create a type
      const type = await prismaService.types.create({
        data: {
          name: 'Test Type',
          story_prompt: 'Create a test story',
          chapter_prompt: 'Create test chapters',
          image_prompt: 'Create test images',
          sound_prompt: 'Create test sounds',
          youtube_channel_id: 'test_channel',
          youtube_playlist_id: 'test_playlist',
        },
      });

      // 2. Create a story
      const storyResponse = await request(app.getHttpServer())
        .post('/stories')
        .send({ types_id: type.id })
        .expect(201);

      const story = storyResponse.body;
      expect(story).toBeDefined();
      expect(story.id).toBeDefined();

      // 3. Generate content
      await request(app.getHttpServer())
        .post(`/stories/${story.id}/generate-content`)
        .expect(201);

      // 4. Generate media
      await request(app.getHttpServer())
        .post(`/stories/${story.id}/generate-media`)
        .expect(201);

      // 5. Publish to YouTube
      const publishResponse = await request(app.getHttpServer())
        .post(`/publishing/${story.id}/youtube`)
        .expect(201);

      expect(publishResponse.body.youtube_url).toBe('test_youtube_url');
    });

    it('should handle errors gracefully when publishing fails', async () => {
      // 1. Create a type
      const type = await prismaService.types.create({
        data: {
          name: 'Test Type',
          story_prompt: 'Create a test story',
          chapter_prompt: 'Create test chapters',
          image_prompt: 'Create test images',
          sound_prompt: 'Create test sounds',
          youtube_channel_id: 'test_channel',
          youtube_playlist_id: 'test_playlist',
        },
      });

      // 2. Create a story
      const storyResponse = await request(app.getHttpServer())
        .post('/stories')
        .send({ types_id: type.id })
        .expect(201);

      const story = storyResponse.body;

      // 3. Generate content
      await request(app.getHttpServer())
        .post(`/stories/${story.id}/generate-content`)
        .expect(201);

      // 4. Generate media
      await request(app.getHttpServer())
        .post(`/stories/${story.id}/generate-media`)
        .expect(201);

      // 5. Mock YouTube service to throw an error
      jest.spyOn(youtubeService, 'uploadVideo').mockRejectedValueOnce(new Error('Upload failed'));

      // 6. Attempt to publish
      await request(app.getHttpServer())
        .post(`/publishing/${story.id}/youtube`)
        .expect(500);
    });
  });

  describe('PublishingController (e2e)', () => {
    describe('GET /publishing/:storyId', () => {
      it('should return a publishing by story id', async () => {
        // 1. Create a type
        const type = await prismaService.types.create({
          data: {
            name: 'Test Type',
            story_prompt: 'Create a test story',
            chapter_prompt: 'Create test chapters',
            image_prompt: 'Create test images',
            sound_prompt: 'Create test sounds',
            youtube_channel_id: 'test_channel',
            youtube_playlist_id: 'test_playlist',
          },
        });

        // 2. Create a story
        const story = await prismaService.stories.create({
          data: {
            name: 'Test Story',
            synopsis: 'Test Synopsis',
            types_id: type.id,
            chapters: {
              create: [
                { number: 1, title: 'Chapter 1', summary: 'Summary 1', content: 'Content 1' },
                { number: 2, title: 'Chapter 2', summary: 'Summary 2', content: 'Content 2' },
                { number: 3, title: 'Chapter 3', summary: 'Summary 3', content: 'Content 3' },
              ],
            },
          },
          include: {
            chapters: true,
          },
        });

        // 3. Create a publishing record
        await prismaService.publishing.create({
          data: {
            story_id: story.id,
            title: 'Test Story',
            description: 'Test Description',
            tags: ['test'],
            youtube_id: 'test_youtube_id',
            patreon_published: false
          },
        });

        // 4. Get the publishing record
        const response = await request(app.getHttpServer())
          .get(`/publishing/${story.id}`)
          .expect(200);

        expect(response.body.youtube_url).toBe('test_youtube_url');
      });

      it('should return 404 if publishing not found', async () => {
        await request(app.getHttpServer())
          .get('/publishing/999')
          .expect(404);
      });
    });

    describe('POST /publishing/:storyId/youtube', () => {
      it('should publish a story to YouTube', async () => {
        // 1. Create a type
        const type = await prismaService.types.create({
          data: {
            name: 'Test Type',
            story_prompt: 'Create a test story',
            chapter_prompt: 'Create test chapters',
            image_prompt: 'Create test images',
            sound_prompt: 'Create test sounds',
            youtube_channel_id: 'test_channel',
            youtube_playlist_id: 'test_playlist',
          },
        });

        // 2. Create a story with content and media
        const story = await prismaService.stories.create({
          data: {
            name: 'Test Story',
            synopsis: 'Test Synopsis',
            types_id: type.id,
            video_url: 'test_video.mp4',
            audio_url: 'test_audio.mp3',
            thumbnail_url: 'test_thumbnail.jpg',
            chapters: {
              create: [
                {
                  number: 1,
                  title: 'Chapter 1',
                  summary: 'Summary 1',
                  content: 'Content 1',
                  video_url: 'test_video_1.mp4',
                  audio_url: 'test_audio_1.mp3',
                },
                {
                  number: 2,
                  title: 'Chapter 2',
                  summary: 'Summary 2',
                  content: 'Content 2',
                  video_url: 'test_video_2.mp4',
                  audio_url: 'test_audio_2.mp3',
                },
                {
                  number: 3,
                  title: 'Chapter 3',
                  summary: 'Summary 3',
                  content: 'Content 3',
                  video_url: 'test_video_3.mp4',
                  audio_url: 'test_audio_3.mp3',
                },
              ],
            },
          },
          include: {
            chapters: true,
          },
        });

        // 3. Publish to YouTube
        const response = await request(app.getHttpServer())
          .post(`/publishing/${story.id}/youtube`)
          .expect(201);

        expect(response.body.youtube_url).toBe('test_youtube_url');
      });

      it('should return 404 if story not found', async () => {
        await request(app.getHttpServer())
          .post('/publishing/999/youtube')
          .expect(404);
      });
    });
  });
}); 