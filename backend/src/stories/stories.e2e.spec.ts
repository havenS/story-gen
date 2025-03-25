import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, cleanupDatabase, createTestType } from '../../test/utils/setup';
import { PrismaService } from '../prisma/prisma.service';
import { GenApiService } from '../gen_api/gen_api.service';
import { LLMService } from '../llm/llm.service';

describe('Story Generation (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let genApiService: GenApiService;
  let llmService: LLMService;

  beforeEach(async () => {
    app = await setupTestApp();
    prismaService = app.get<PrismaService>(PrismaService);
    genApiService = app.get<GenApiService>(GenApiService);
    llmService = app.get<LLMService>(LLMService);
    await cleanupDatabase(prismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /stories', () => {
    it('should create a story', async () => {
      const testType = await createTestType(prismaService);

      const response = await request(app.getHttpServer())
        .post('/stories')
        .send({ types_id: testType.id })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('synopsis');
      expect(response.body).toHaveProperty('types_id', testType.id);
    });

    it('should handle errors gracefully when story creation fails', async () => {
      await request(app.getHttpServer())
        .post('/stories')
        .send({ types_id: 999 })
        .expect(404);
    });
  });

  describe('PUT /stories/:id/generate-content', () => {
    it('should generate content for a story', async () => {
      const testType = await createTestType(prismaService);
      const story = await prismaService.stories.create({
        data: {
          name: 'Test Story',
          synopsis: 'Test Synopsis',
          types_id: testType.id,
        },
      });

      const response = await request(app.getHttpServer())
        .put(`/stories/${story.id}/generate-content`)
        .expect(200);

      expect(response.body).toHaveProperty('id', story.id);
      expect(response.body).toHaveProperty('name', 'Test Story');
      expect(response.body).toHaveProperty('synopsis', 'Test Synopsis');
      expect(response.body).toHaveProperty('types_id', testType.id);
    });
  });

  describe('POST /stories/:id/generate-chapter-media', () => {
    it('should generate media for a story', async () => {
      const testType = await createTestType(prismaService);
      const story = await prismaService.stories.create({
        data: {
          name: 'Test Story',
          synopsis: 'Test Synopsis',
          types_id: testType.id,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/stories/${story.id}/generate-chapter-media`)
        .expect(201);

      expect(response.body).toHaveProperty('id', story.id);
      expect(response.body).toHaveProperty('name', 'Test Story');
      expect(response.body).toHaveProperty('synopsis', 'Test Synopsis');
      expect(response.body).toHaveProperty('types_id', testType.id);
    });
  });
});
