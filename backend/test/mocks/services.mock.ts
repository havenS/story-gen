import { jest } from '@jest/globals';
import { LLMService } from '../../src/llm/llm.service';
import { GenApiService } from '../../src/gen_api/gen_api.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { testTypeData } from '../fixtures/story.fixture';
import { YoutubeService } from '../../src/youtube/youtube.service';
import { Injectable } from '@nestjs/common';
import { StoryDto } from '../../src/stories/dto/story.dto';
import { PublishingService } from '../../src/publishing/publishing.service';
import { StoriesService } from '../../src/stories/stories.service';
import { PublishingDto } from '../../src/publishing/dto/publishing.dto';
import { TypesService } from 'src/types/types.service';
import { StoryWithRelations } from 'src/stories/types/story-with-relations';
import { LLMResponseType } from 'src/llm/types/llm-response.type';
import { Prisma } from '@prisma/client';
import { YoutubeResponseType } from 'src/youtube/types/youtube-response.type';
import { LLMMessageType } from 'src/llm/types/llm-message.type';
import { ChapterDto } from 'src/chapters/dto/chapter.dto';
import { StoryInfoType } from 'src/llm/types/story-info.type';

@Injectable()
export class MockLLMService implements Partial<LLMService> {
  async pingLLM(): Promise<boolean> {
    return true;
  }

  async callLLM(
    _model: string,
    _method: string,
    _json: boolean,
    _temperature?: number,
    messages?: LLMMessageType[],
  ): Promise<LLMResponseType> {
    // Check if this is a story generation request
    if (
      messages?.some((msg) => msg.content.includes(testTypeData.story_prompt))
    ) {
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
      } as LLMResponseType;
    }
    return {
      message: {
        content: 'test content',
      },
    } as LLMResponseType;
  }

  async generateStoryInfo(
    _model: string,
    _prompt: string,
    _history: StoryDto[],
  ): Promise<StoryInfoType> {
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

  async generateYouTubeMetadata(): Promise<{
    title: string;
    description: string;
    tags: string[];
  }> {
    return {
      title: 'Test YouTube Title',
      description: 'Test YouTube Description',
      tags: ['test', 'tags'],
    };
  }

  async generateStoryName(): Promise<string> {
    return 'Test Story Name';
  }

  async generateChapterExceptForShort(): Promise<string> {
    return 'Test chapter excerpt';
  }
}

@Injectable()
export class MockGenApiService implements Partial<GenApiService> {
  async generateStoryMedia(
    _story: StoryDto,
    _folderName: string,
    _backgroundImage: string,
  ): Promise<{
    audioFileName: string;
    videoFileName: string;
    thumbnailFileName: string;
  }> {
    return {
      audioFileName: 'story.mp3',
      videoFileName: 'story.mp4',
      thumbnailFileName: 'thumbnail.jpg',
    };
  }

  async generateChapterMedia(
    _chapter: ChapterDto,
    _folderName: string,
  ): Promise<{ audioFileName: string; videoFileName: string }> {
    return {
      audioFileName: 'chapter.mp3',
      videoFileName: 'chapter.mp4',
    };
  }
}

@Injectable()
export class MockYoutubeService implements Partial<YoutubeService> {
  async uploadVideo(
    _channelId: string,
    _playlistId: string,
    _videoPath: string,
    metadata: {
      title: string;
      description: string;
      tags: string[];
      thumbnail: string;
    },
    _shortsPath: string[],
  ): Promise<YoutubeResponseType> {
    return {
      id: 'test-video-id',
      snippet: {
        title: metadata.title,
        description: metadata.description,
        thumbnails: {
          default: {
            url: metadata.thumbnail,
            width: 120,
            height: 90,
          },
        },
      },
    };
  }

  async uploadShorts(
    _videoId: string,
    _shortsPaths: string[],
    _metadata: { title: string; description: string; tags: string[] },
    _publishHour: number,
  ): Promise<void> {
    // Do nothing
  }

  async generateMetadata(
    story: Partial<StoryDto>,
    thumbnailPath: string,
  ): Promise<{
    title: string;
    description: string;
    tags: string[];
    thumbnail: string;
  }> {
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

  async updatePublishing(
    id: number,
    data: Partial<PublishingDto>,
  ): Promise<PublishingDto> {
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
  async findOne(id: number): Promise<StoryWithRelations> {
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
        chapter_count: 3,
        word_count: 1000,
      },
      chapters: [],
    };
  }

  getFolderName(_story: StoryDto): string {
    return 'test-story';
  }
}

export function createMockTypesService(
  prisma: PrismaService,
): Partial<TypesService> {
  return {
    findAll: jest.fn().mockImplementation(async () => {
      return prisma.types.findMany();
    }),
    findOne: jest.fn().mockImplementation(async (id: number) => {
      return prisma.types.findUnique({ where: { id } });
    }),
    create: jest
      .fn()
      .mockImplementation(async (data: Prisma.typesCreateInput) => {
        return prisma.types.create({ data });
      }),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as TypesService;
}
