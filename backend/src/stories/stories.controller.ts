import { Controller, Post, Body, Param, Get, Put, Delete } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoryDto } from './dto/story.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStoryDto } from './dto/create-story.dto';
import { Logger } from '@nestjs/common';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  private readonly logger = new Logger(StoriesController.name);

  constructor(private readonly storiesService: StoriesService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new story' })
  @ApiResponse({
    status: 201,
    description: 'The story has been successfully created.',
    type: StoryDto,
  })
  async create(@Body() createStoryDto: CreateStoryDto): Promise<StoryDto> {
    this.logger.log(`Creating new story with type ID: ${createStoryDto.types_id}...`);
    const story = await this.storiesService.createStory(createStoryDto.types_id);
    this.logger.log(`Successfully created story with ID: ${story.id}`);
    return story;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a story by ID' })
  @ApiResponse({
    status: 200,
    description: 'The story has been successfully retrieved.',
    type: StoryDto,
  })
  async findOne(@Param('id') id: string): Promise<StoryDto> {
    this.logger.log(`Fetching story with ID: ${id}...`);
    const story = await this.storiesService.findOne(parseInt(id, 10));
    this.logger.log(`Successfully fetched story with ID: ${id}`);
    return story;
  }

  @Put(':id/generate-content')
  @ApiOperation({ summary: 'Generate content for a story' })
  @ApiResponse({
    status: 200,
    description: 'The content has been successfully generated.',
    type: StoryDto,
  })
  async generateContent(@Param('id') id: string): Promise<StoryDto> {
    this.logger.log(`Generating content for story with ID: ${id}...`);
    const story = await this.storiesService.generateChaptersContent(parseInt(id, 10));
    this.logger.log(`Successfully generated content for story with ID: ${id}`);
    return story;
  }

  @Post(':id/generate-chapter-media')
  @ApiOperation({ summary: 'Generate chapter media for a story' })
  @ApiResponse({
    status: 200,
    description: 'The media has been successfully generated.',
    type: StoryDto,
  })
  async generateStoryChapterMedia(@Param('id') id: string): Promise<StoryDto> {
    const story = await this.storiesService.generateChaptersMedia(
      parseInt(id, 10),
    );
    return story;
  }

  @Post(':id/generate-media')
  @ApiOperation({ summary: 'Generate media for a story' })
  @ApiResponse({
    status: 200,
    description: 'The media has been successfully generated.',
    type: StoryDto,
  })
  async generateFullStoryMedia(@Param('id') id: string): Promise<StoryDto> {
    this.logger.log(`Generating media for story with ID: ${id}...`);
    const story = await this.storiesService.generateFullStoryMedia(parseInt(id, 10));
    this.logger.log(`Successfully generated media for story with ID: ${id}`);
    return story;
  }

  @Post(':id/generate-background-image')
  @ApiOperation({ summary: 'Generate background image for a story' })
  @ApiResponse({
    status: 200,
    description: 'The background image has been successfully generated.',
    type: StoryDto,
  })
  async generateStoryBackgroundImage(
    @Param('id') id: string,
  ): Promise<StoryDto> {
    const story = await this.storiesService.findOne(parseInt(id, 10));

    await this.storiesService.generateStoryBackgroundImage(story);

    return this.storiesService.findOne(parseInt(id, 10));
  }

  @Post('create-and-generate')
  @ApiOperation({
    summary: 'Create a new story and generate all content and media',
  })
  @ApiResponse({
    status: 201,
    description:
      'The story has been created and all content has been generated.',
    type: StoryDto,
  })
  async createAndGenerate(
    @Body('types_id') types_id: number,
  ): Promise<StoryDto> {
    this.logger.log(`Starting create-and-generate process for type ID: ${types_id}...`);
    const story = await this.storiesService.createStory(types_id);
    this.logger.log(`Created story with ID: ${story.id}, generating content...`);
    await this.storiesService.generateChaptersContent(story.id);
    this.logger.log(`Generated content, generating chapters media...`);
    await this.storiesService.generateChaptersMedia(story.id);
    this.logger.log(`Generated chapters media, generating full story media...`);
    await this.storiesService.generateFullStoryMedia(story.id);
    this.logger.log(`Generated full story media, generating background image...`);
    await this.storiesService.generateStoryBackgroundImage(story);
    this.logger.log(`Successfully completed create-and-generate process for story ID: ${story.id}`);
    return this.storiesService.findOne(story.id);
  }
}
