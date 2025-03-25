import { jest } from '@jest/globals';
import { LLMService } from '../../src/llm/llm.service';
import { GenApiService } from '../../src/gen_api/gen_api.service';
import { TypesService } from '../../src/types/types.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  expectedStoryResponse,
  expectedMediaResponse,
  testTypeData,
} from '../fixtures/story.fixture';
import { YoutubeService } from '../../src/youtube/youtube.service';
import { Injectable } from '@nestjs/common';
import { StoryDto } from '../../src/stories/dto/story.dto';
import { PublishingService } from '../../src/publishing/publishing.service';
import { StoriesService } from '../../src/stories/stories.service';
import { PublishingDto } from '../../src/publishing/dto/publishing.dto';

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

type PublishingServiceMock = {
  [K in keyof PublishingService]: jest.Mock;
};

type StoriesServiceMock = {
  [K in keyof StoriesService]: jest.Mock;
};

@Injectable()
export class MockLLMService implements Partial<LLMService> {
  async pingLLM(): Promise<boolean> {
    return true;
  }

  async callLLM(model: string, method: string, json: boolean, temperature?: number, messages?: any[], seed?: number): Promise<any> {
    // Check if this is a story generation request
    if (messages?.some(msg => msg.content.includes(testTypeData.story_prompt))) {
      return {
        message: {
          content: JSON.stringify({
            title: 'Test Story',
            synopsis: 'Test Synopsis',
            chapterOneTitle: 'Chapter 1',
            chapterOneSummary: 'Summary 1',
            chapterTwoTitle: 'Chapter 2',
            chapterTwoSummary: 'Summary 2',
            chapterThreeTitle: 'Chapter 3',
            chapterThreeSummary: 'Summary 3',
          }),
        },
      };
    }
    return {
      message: {
        content: 'test content',
      },
    };
  }

  async generateStoryInfo(type: any): Promise<any> {
    return {
      title: 'Test Story',
      synopsis: 'Test Synopsis',
      chapterOneTitle: 'Chapter 1',
      chapterOneSummary: 'Summary 1',
      chapterTwoTitle: 'Chapter 2',
      chapterTwoSummary: 'Summary 2',
      chapterThreeTitle: 'Chapter 3',
      chapterThreeSummary: 'Summary 3',
    };
  }

  async generateStoryImagePrompt(): Promise<string> {
    return 'test image prompt';
  }

  async generateChapterContent(): Promise<string[]> {
    return ['Content 1', 'Content 2', 'Content 3'];
  }

  async getChapterBackgroundSound(): Promise<{ sound: string }> {
    return { sound: 'test sound' };
  }

  async generateYouTubeMetadata(): Promise<{ title: string; description: string; tags: string[] }> {
    return {
      title: 'Test YouTube Title',
      description: 'Test YouTube Description',
      tags: ['test', 'tags'],
    };
  }

  async generateChapterExceptForShort(): Promise<string> {
    return 'Test chapter excerpt';
  }
}

@Injectable()
export class MockGenApiService implements Partial<GenApiService> {
  async generateStoryMedia(): Promise<any> {
    return {
      videoUrl: 'https://example.com/video.mp4',
      audioUrl: 'https://example.com/audio.mp3',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      chapters: [
        {
          videoUrl: 'https://example.com/chapter1.mp4',
          audioUrl: 'https://example.com/chapter1.mp3',
        },
        {
          videoUrl: 'https://example.com/chapter2.mp4',
          audioUrl: 'https://example.com/chapter2.mp3',
        },
        {
          videoUrl: 'https://example.com/chapter3.mp4',
          audioUrl: 'https://example.com/chapter3.mp3',
        },
      ],
    };
  }

  async generateChapterMedia(chapter: any, folderName: string): Promise<{ audioFileName: string; videoFileName: string }> {
    return {
      audioFileName: 'chapter.mp3',
      videoFileName: 'chapter.mp4',
    };
  }
}

@Injectable()
export class MockYoutubeService implements Partial<YoutubeService> {
  async uploadVideo(channelId: string, playlistId: string, videoPath: string, metadata: { title: string; description: string; tags: string[]; thumbnail: string; }, shortsPath: string[]): Promise<any> {
    return {
      id: 'test-video-id',
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        thumbnails: {
          default: {
            url: metadata.thumbnail,
          },
        },
      },
    };
  }

  async uploadShorts(videoId: string, shortsPaths: string[], metadata: { title: string; description: string; tags: string[]; }, publishHour: number): Promise<void> {
    // Do nothing
  }

  async generateMetadata(story: Partial<StoryDto>, thumbnailPath: string): Promise<{ title: string; description: string; tags: string[]; thumbnail: string }> {
    return {
      title: 'Test Story',
      description: 'Test Synopsis',
      tags: ['test', 'story'],
      thumbnail: thumbnailPath,
    };
  }

  getAuthUrl(): string {
    return 'https://test-auth-url.com';
  }

  async logout(): Promise<void> {
    // Do nothing
  }

  async saveTokenFromCode(): Promise<void> {
    // Do nothing
  }
}

@Injectable()
export class MockPublishingService implements Partial<PublishingService> {
  async findOnePublishing(storyId: number): Promise<PublishingDto> {
    return {
      id: 1,
      story_id: storyId,
      title: 'Test Story',
      description: 'Test Description',
      tags: ['test'],
      youtube_id: 'test123',
      patreon_published: false,
    };
  }

  async updatePublishing(id: number, data: Partial<PublishingDto>): Promise<PublishingDto> {
    return {
      id,
      story_id: 1,
      title: 'Test Story',
      description: 'Test Description',
      tags: ['test'],
      youtube_id: data.youtube_id || 'test123',
      patreon_published: false,
    };
  }
}

@Injectable()
export class MockStoriesService implements Partial<StoriesService> {
  async findOne(id: number): Promise<StoryDto> {
    return {
      id,
      name: 'Test Story',
      synopsis: 'Test Synopsis',
      types_id: 1,
      audio_url: '',
      image_prompt: '',
      background_image: '',
      thumbnail_url: '',
      video_url: '',
      types: {
        id: 1,
        name: 'Test Type',
        story_prompt: 'Test Story Prompt',
        chapter_prompt: 'Test Chapter Prompt',
        image_prompt: 'Test Image Prompt',
        sound_prompt: 'Test Sound Prompt',
        youtube_channel_id: 'channel123',
        youtube_playlist_id: 'playlist123',
      },
      chapters: [],
    };
  }

  getFolderName(story: StoryDto): string {
    return 'test-story';
  }
}

export function createMockTypesService(
  prisma: PrismaService,
): TypesServiceMock {
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
    remove: jest.fn(),
  } as unknown as TypesServiceMock;
}
