import { Controller, Get, Param, Post, NotFoundException, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { StoryDto } from '../stories/dto/story.dto';
import { StoriesService } from '../stories/stories.service';
import { YoutubeService } from '../youtube/youtube.service';
import { PublishingService } from './publishing.service';
import * as fs from 'fs';

@Controller('publishing')
export class PublishingController {
  constructor(
    private publishingService: PublishingService,
    private youtubeService: YoutubeService,
    private storiesService: StoriesService,
  ) { }

  @Get(':storyId')
  async getPublishing(@Param('storyId') storyId: string) {
    return this.publishingService.findOnePublishing(parseInt(storyId, 10));
  }

  @Post(':storyId/youtube')
  async publishYoutube(@Param('storyId') storyId: string) {
    try {
      const story: Partial<StoryDto> = await this.storiesService.findOne(
        parseInt(storyId, 10),
      );

      if (!story) {
        throw new NotFoundException(`Story with ID ${storyId} not found`);
      }

      if (!story.types?.youtube_channel_id || !story.types?.youtube_playlist_id) {
        throw new BadRequestException('Story type is missing YouTube configuration');
      }

      const folderName = this.storiesService.getFolderName(story);
      const videoPath = join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'generation',
        folderName,
        'full_story.mp4',
      );
      const thumbnailPath = join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'generation',
        folderName,
        'thumbnail.jpg',
      );
      const shortsPath = [
        join(
          __dirname,
          '..',
          '..',
          '..',
          'public',
          'generation',
          folderName,
          'short_1.mp4',
        ),
        join(
          __dirname,
          '..',
          '..',
          '..',
          'public',
          'generation',
          folderName,
          'short_2.mp4',
        ),
        join(
          __dirname,
          '..',
          '..',
          '..',
          'public',
          'generation',
          folderName,
          'short_3.mp4',
        ),
      ];

      // Check if files exist
      if (!fs.existsSync(videoPath)) {
        throw new BadRequestException('Video file not found. Please generate the video first.');
      }
      if (!fs.existsSync(thumbnailPath)) {
        throw new BadRequestException('Thumbnail file not found. Please generate the thumbnail first.');
      }

      const metadata = await this.youtubeService.generateMetadata(
        story,
        thumbnailPath,
      );

      if (!metadata) {
        throw new BadRequestException('Failed to generate YouTube metadata');
      }

      const response = await this.youtubeService.uploadVideo(
        story.types.youtube_channel_id,
        story.types.youtube_playlist_id,
        videoPath,
        metadata,
        shortsPath,
      );

      if (!response?.id) {
        throw new Error('Failed to upload video to YouTube');
      }

      await this.publishingService.createPublishing({
        story_id: parseInt(storyId, 10),
        description: metadata.description || '',
        title: metadata.title || story.name || 'Untitled Story',
        tags: metadata.tags || [],
        youtube_id: response.id,
      });

      return response;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to publish to YouTube: ${error.message}`);
    }
  }
}
