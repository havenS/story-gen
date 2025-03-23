import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoryDto } from './dto/story.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  @ApiResponse({ status: 201, description: 'The story has been successfully created.', type: StoryDto })
  async create(
    @Body('types_id') types_id: number,
  ): Promise<StoryDto> {
    const story = await this.storiesService.create(types_id);
    return story;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a story by ID' })
  @ApiResponse({ status: 200, description: 'The story has been successfully retrieved.', type: StoryDto })
  async findOne(
    @Param('id') id: string,
  ): Promise<StoryDto> {
    const story = await this.storiesService.findOne(parseInt(id, 10));
    return story;
  }

  @Post(':id/generate-content')
  @ApiOperation({ summary: 'Generate content for a story' })
  @ApiResponse({ status: 200, description: 'The content has been successfully generated.', type: StoryDto })
  async generateChapterContent(
    @Param('id') id: string,
  ): Promise<StoryDto> {
    const story = await this.storiesService.generateChapterContent(parseInt(id, 10));
    return story;
  }

  @Post(':id/generate-chapter-media')
  @ApiOperation({ summary: 'Generate chapter media for a story' })
  @ApiResponse({ status: 200, description: 'The media has been successfully generated.', type: StoryDto })
  async generateStoryChapterMedia(
    @Param('id') id: string,
  ): Promise<StoryDto> {
    const story = await this.storiesService.generateChaptersMedia(parseInt(id, 10));
    return story;
  }

  @Post(':id/generate-media')
  @ApiOperation({ summary: 'Generate media for a story' })
  @ApiResponse({ status: 200, description: 'The media has been successfully generated.', type: StoryDto })
  async generateFullStoryMedia(
    @Param('id') id: string,
  ): Promise<StoryDto> {
    const story = await this.storiesService.generateFullStoryMedia(parseInt(id, 10));
    return story;
  }

  @Post(':id/generate-background-image')
  @ApiOperation({ summary: 'Generate background image for a story' })
  @ApiResponse({ status: 200, description: 'The background image has been successfully generated.', type: StoryDto })
  async generateStoryBackgroundImage(
    @Param('id') id: string,
  ): Promise<StoryDto> {
    const story = await this.storiesService.findOne(parseInt(id, 10));

    await this.storiesService.generateStoryBackgroundImage(story);

    return this.storiesService.findOne(parseInt(id, 10));
  }
}
