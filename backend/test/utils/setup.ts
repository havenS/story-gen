import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LLMService } from '../../src/llm/llm.service';
import { GenApiService } from '../../src/gen_api/gen_api.service';
import { TypesService } from '../../src/types/types.service';
import { YoutubeService } from '../../src/youtube/youtube.service';
import { mockLLMService, mockGenApiService, createMockTypesService, mockYoutubeService } from '../mocks/services.mock';
import { testTypeData } from '../fixtures/story.fixture';
import { execSync } from 'child_process';

export interface TestContext {
  app: INestApplication;
  prismaService: PrismaService;
  llmService: LLMService;
  genApiService: GenApiService;
  typesService: TypesService;
  youtubeService: YoutubeService;
}

export async function setupTestApp(): Promise<TestContext> {
  // Run migrations
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LLMService)
    .useValue(mockLLMService)
    .overrideProvider(GenApiService)
    .useValue(mockGenApiService)
    .overrideProvider(YoutubeService)
    .useValue(mockYoutubeService)
    .compile();

  const app = moduleFixture.createNestApplication();
  const prismaService = moduleFixture.get<PrismaService>(PrismaService);
  const typesService = createMockTypesService(prismaService);

  await app.init();

  return {
    app,
    prismaService,
    llmService: mockLLMService as unknown as LLMService,
    genApiService: mockGenApiService as unknown as GenApiService,
    typesService: typesService as unknown as TypesService,
    youtubeService: mockYoutubeService as unknown as YoutubeService,
  };
}

export async function cleanupDatabase(prisma: PrismaService) {
  await prisma.publishing.deleteMany();
  await prisma.chapters.deleteMany();
  await prisma.stories.deleteMany();
  await prisma.types.deleteMany();
}

export async function createTestType(prisma: PrismaService) {
  return await prisma.types.create({
    data: testTypeData
  });
} 