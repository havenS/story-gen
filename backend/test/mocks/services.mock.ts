import { jest } from '@jest/globals';
import { LLMService } from '../../src/llm/llm.service';
import { GenApiService } from '../../src/gen_api/gen_api.service';
import { TypesService } from '../../src/types/types.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { StoryDto } from '../../src/stories/dto/story.dto';
import { ChapterDto } from '../../src/stories/dto/chapter.dto';
import { expectedStoryResponse, expectedMediaResponse } from '../fixtures/story.fixture';
import { YoutubeService } from '../../src/youtube/youtube.service';

interface LLMResponse {
  title: string;
  synopsis: string;
  chapters: Array<{
    title: string;
    summary: string;
  }>;
}

interface ChapterMediaResponse {
  videoUrl: string;
  audioUrl: string;
}

interface StoryMediaResponse {
  videoUrl: string;
  audioUrl: string;
  thumbnailUrl: string;
  chapters: ChapterMediaResponse[];
}

interface YouTubeMetadata {
  title: string;
  description: string;
  tags: string[];
}

type LLMServiceMock = {
  [K in keyof LLMService]: jest.Mock;
};

type GenApiServiceMock = {
  [K in keyof GenApiService]: jest.Mock;
};

type TypesServiceMock = {
  [K in keyof TypesService]: jest.Mock;
};

type YoutubeServiceMock = {
  [K in keyof YoutubeService]: jest.Mock;
};

export const mockLLMService: LLMServiceMock = {
  pingLLM: jest.fn().mockImplementation(async () => ({ status: 'ok' })),
  callLLM: jest.fn().mockImplementation(async () => ({ message: { content: JSON.stringify(expectedStoryResponse) } })),
  generateStoryInfo: jest.fn().mockImplementation(async () => expectedStoryResponse),
  generateStoryImagePrompt: jest.fn().mockImplementation(async () => 'test image prompt'),
  generateChapterContent: jest.fn().mockImplementation(async () => ['Content 1', 'Content 2', 'Content 3']),
  getChapterBackgroundSound: jest.fn().mockImplementation(async () => ({ sound: 'test sound' })),
  generateYouTubeMetadata: jest.fn().mockImplementation(async () => ({
    title: 'Test YouTube Title',
    description: 'Test YouTube Description',
    tags: ['test', 'tags']
  })),
  generateChapterExceptForShort: jest.fn().mockImplementation(async () => 'Test chapter excerpt')
} as unknown as LLMServiceMock;

export const mockGenApiService: GenApiServiceMock = {
  generateStoryMedia: jest.fn().mockImplementation(async () => expectedMediaResponse),
  generateChapterMedia: jest.fn().mockImplementation(async () => ({
    videoUrl: 'https://example.com/chapter.mp4',
    audioUrl: 'https://example.com/chapter.mp3'
  }))
} as unknown as GenApiServiceMock;

export const mockYoutubeService: YoutubeServiceMock = {
  uploadVideo: jest.fn().mockImplementation(async () => ({ id: 'test-video-id' })),
  uploadShorts: jest.fn().mockImplementation(async () => ({ id: 'test-shorts-id' })),
  generateMetadata: jest.fn().mockImplementation(async () => ({
    title: 'Test Video',
    description: 'Test Description',
    tags: ['test', 'video'],
  })),
  getAuthUrl: jest.fn().mockImplementation(() => 'https://test-auth-url.com'),
  logout: jest.fn().mockImplementation(async () => { }),
  saveTokenFromCode: jest.fn().mockImplementation(async () => { }),
};

export function createMockTypesService(prisma: PrismaService): TypesServiceMock {
  return {
    findAll: jest.fn().mockImplementation(async () => {
      return prisma.types.findMany();
    }),
    findOne: jest.fn().mockImplementation(async (id: number) => {
      return prisma.types.findUnique({ where: { id } });
    }),
    create: jest.fn().mockImplementation(async (data: any) => {
      return prisma.types.create({ data });
    }),
    update: jest.fn(),
    remove: jest.fn()
  } as unknown as TypesServiceMock;
} 