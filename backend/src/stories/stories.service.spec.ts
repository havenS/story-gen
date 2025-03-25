import { Test, TestingModule } from '@nestjs/testing';
import { StoriesService } from './stories.service';
import { PrismaService } from '../prisma/prisma.service';
import { LLMService } from '../llm/llm.service';
import { TypesService } from '../types/types.service';
import { GenApiService } from '../gen_api/gen_api.service';

describe('StoriesService', () => {
  let service: StoriesService;

  const mockPrismaService = {
    stories: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockLLMService = {
    generateStoryInfo: jest.fn(),
    generateStoryImagePrompt: jest.fn(),
    generateChapterContent: jest.fn(),
    generateChapterExceptForShort: jest.fn(),
    getChapterBackgroundSound: jest.fn(),
  };

  const mockTypesService = {
    getImagePrompt: jest.fn(),
  };

  const mockGenApiService = {
    generateChapterMedia: jest.fn(),
    generateStoryMedia: jest.fn(),
    generateImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LLMService,
          useValue: mockLLMService,
        },
        {
          provide: TypesService,
          useValue: mockTypesService,
        },
        {
          provide: GenApiService,
          useValue: mockGenApiService,
        },
      ],
    }).compile();

    service = module.get<StoriesService>(StoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFolderName', () => {
    it('should return the correct folder name format', () => {
      const story = { id: 123 };
      const result = service.getFolderName(story);
      expect(result).toBe('story_123');
    });
  });
});
