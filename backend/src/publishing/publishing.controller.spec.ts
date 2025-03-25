import { Test, TestingModule } from '@nestjs/testing';
import { PublishingController } from './publishing.controller';
import { PublishingService } from './publishing.service';
import { StoriesService } from '../stories/stories.service';
import { YoutubeService } from '../youtube/youtube.service';
import { StoryDto } from '../stories/dto/story.dto';
import { PublishingDto } from './dto/publishing.dto';
import { TypeDto } from '../types/dto/type.dto';

describe('PublishingController', () => {
  let controller: PublishingController;

  const mockPublishingService = {
    findOnePublishing: jest.fn(),
    updatePublishing: jest.fn(),
  };

  const mockStoriesService = {
    findOneStory: jest.fn(),
    getFolderName: jest.fn(),
  };

  const mockYoutubeService = {
    uploadVideo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishingController],
      providers: [
        {
          provide: PublishingService,
          useValue: mockPublishingService,
        },
        {
          provide: StoriesService,
          useValue: mockStoriesService,
        },
        {
          provide: YoutubeService,
          useValue: mockYoutubeService,
        },
      ],
    }).compile();

    controller = module.get<PublishingController>(PublishingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPublishing', () => {
    it('should return a publishing by story id', async () => {
      const storyId = '1';
      const expectedPublishing = {
        id: 1,
        story_id: 1,
        title: 'Test Story',
        description: 'Test Description',
        tags: ['test'],
        youtube_id: 'test123',
        patreon_published: false,
      };

      mockPublishingService.findOnePublishing.mockResolvedValue(
        expectedPublishing,
      );

      const result = await controller.getPublishing(storyId);

      expect(result).toEqual(expectedPublishing);
      expect(mockPublishingService.findOnePublishing).toHaveBeenCalledWith(1);
    });
  });

  describe('publishYoutube', () => {
    it('should publish a story to YouTube', async () => {
      const storyId = '1';
      const mockType: TypeDto = {
        id: 1,
        name: 'Test Type',
        story_prompt: 'Test Story Prompt',
        chapter_prompt: 'Test Chapter Prompt',
        image_prompt: 'Test Image Prompt',
        sound_prompt: 'Test Sound Prompt',
        youtube_channel_id: 'channel123',
        youtube_playlist_id: 'playlist123',
      };
      const mockStory: Partial<StoryDto> = {
        id: 1,
        name: 'Test Story',
        types: mockType,
        thumbnail_url: 'thumbnail.jpg',
      };
      const mockPublishing: Partial<PublishingDto> = {
        id: 1,
        story_id: 1,
        title: 'Test Story',
        description: 'Test Description',
        tags: ['test'],
        youtube_id: '',
        patreon_published: false,
      };
      const mockYoutubeResponse = {
        id: 'test123',
      };

      mockStoriesService.findOneStory.mockResolvedValue(mockStory);
      mockPublishingService.findOnePublishing.mockResolvedValue(mockPublishing);
      mockStoriesService.getFolderName.mockReturnValue('test-story');
      mockYoutubeService.uploadVideo.mockResolvedValue(mockYoutubeResponse);
      mockPublishingService.updatePublishing.mockResolvedValue({
        ...mockPublishing,
        youtube_id: mockYoutubeResponse.id,
      });

      const result = await controller.publishYoutube(storyId);

      expect(result).toEqual(mockYoutubeResponse);
      expect(mockStoriesService.findOneStory).toHaveBeenCalledWith(1);
      expect(mockPublishingService.findOnePublishing).toHaveBeenCalledWith(1);
      expect(mockStoriesService.getFolderName).toHaveBeenCalledWith(mockStory);
      expect(mockYoutubeService.uploadVideo).toHaveBeenCalledWith(
        mockType.youtube_channel_id,
        mockType.youtube_playlist_id,
        expect.any(String),
        {
          title: mockPublishing.title,
          description: mockPublishing.description,
          tags: mockPublishing.tags,
          thumbnail: mockStory.thumbnail_url,
        },
        expect.any(Array),
      );
      expect(mockPublishingService.updatePublishing).toHaveBeenCalledWith(1, {
        youtube_id: mockYoutubeResponse.id,
      });
    });
  });
});
