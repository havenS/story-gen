import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { LLMService } from '../../src/llm/llm.service';
import { GenApiService } from '../../src/gen_api/gen_api.service';
import { TypesService } from '../../src/types/types.service';
import { YoutubeService } from '../../src/youtube/youtube.service';
import {
  MockLLMService,
  MockGenApiService,
  MockYoutubeService,
} from '../mocks/services.mock';
import { testTypeData } from '../fixtures/story.fixture';
import { PrismaService } from 'src/prisma/prisma.service';

export interface TestContext {
  app: INestApplication;
  prismaService: any;
  llmService: LLMService;
  genApiService: GenApiService;
  typesService: TypesService;
  youtubeService: YoutubeService;
}

export const setupTestApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(LLMService)
    .useClass(MockLLMService)
    .overrideProvider(GenApiService)
    .useClass(MockGenApiService)
    .overrideProvider(YoutubeService)
    .useClass(MockYoutubeService)
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  await app.listen(0);

  return app;
};

export async function cleanupDatabase(prismaService: PrismaService) {
  // Delete in order of dependencies
  prismaService.publishing.deleteMany()
  prismaService.chapters.deleteMany()
  prismaService.stories.deleteMany()
  prismaService.types.deleteMany()
}

export async function createTestType(prisma: any) {
  return await prisma.types.create({
    data: testTypeData,
  });
}
