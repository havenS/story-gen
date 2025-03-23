import { Controller, Get, Param, Post } from '@nestjs/common';
import { join } from 'path';
import { StoryDto } from '../stories/dto/story.dto';
import { StoriesService } from '../stories/stories.service';
import { YoutubeService } from '../youtube/youtube.service';
import { PublishingService } from './publishing.service';
import { PublishingDto } from './dto/publishing.dto';
import { S } from 'ollama/dist/shared/ollama.51f6cea9';

@Controller('publishing')
export class PublishingController {
  constructor(private publishingService: PublishingService, private youtubeService: YoutubeService, private storiesService: StoriesService) { }

  @Get(':storyId')
  async getPublishing(@Param('storyId') storyId: string) {
    return this.publishingService.findOnePublishing(parseInt(storyId, 10));
  }

  @Post(':storyId/youtube')
  async publishYoutube(@Param('storyId') storyId: string) {
    const story: Partial<StoryDto> = await this.storiesService.findOne(parseInt(storyId, 10));

    const folderName = this.storiesService.getFolderName(story);
    const videoPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName, 'full_story.mp4');
    const thumbnailPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName, 'thumbnail.jpg');
    const shortsPath = [
      join(__dirname, '..', '..', '..', 'public', 'generation', folderName, 'short_1.mp4'),
      join(__dirname, '..', '..', '..', 'public', 'generation', folderName, 'short_2.mp4'),
      join(__dirname, '..', '..', '..', 'public', 'generation', folderName, 'short_3.mp4'),
    ];

    const metadata = await this.youtubeService.generateMetadata(story, thumbnailPath);

    const response = await this.youtubeService.uploadVideo(
      story.types.youtube_channel_id,
      story.types.youtube_playlist_id,
      videoPath,
      metadata,
      shortsPath
    );
    await this.publishingService.createPublishing({
      story_id: parseInt(storyId, 10),
      description: metadata.description,
      title: metadata.title,
      tags: metadata.tags,
      youtube_id: response.id
    });
    return response;
  }
}
