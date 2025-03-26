import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LLMService } from '../llm/llm.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeDto } from '../types/dto/type.dto';
import { StoryDto } from './dto/story.dto';
import { TypesService } from '../types/types.service';
import { GenApiService } from '../gen_api/gen_api.service';
import { StoryWithRelations } from './types/story-with-relations';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly typesService: TypesService,
    private readonly genApiService: GenApiService,
  ) { }

  getFolderName(story: Partial<StoryDto>) {
    this.logger.debug(`Generating folder name for story: ${story?.name || story?.id || 'unknown'}`);
    if (!story?.name) {
      return `story_${story?.id || Date.now()}`;
    }
    return story.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  /**
   * Generate the content of the chapters of a story using the LLM service
   * @param storyId
   * @param retryNumber
   * @returns Story with updated chapters content
   */
  async generateChaptersContent(storyId: number, retryNumber = 0) {
    this.logger.log(`Starting chapter content generation for story ID: ${storyId} (attempt ${retryNumber + 1})`);
    const story = await this.prisma.stories.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          orderBy: {
            number: 'asc',
          },
        },
        types: true,
        publishings: true,
      },
    });

    let chaptersContent;
    try {
      this.logger.debug('Generating chapter content using LLM service...');
      chaptersContent = await this.llmService.generateChapterContent(
        process.env.OLLAMA_CHAPTER_CONTENT_MODEL,
        story.types.chapter_prompt,
        story as unknown as StoryDto,
      );
      if (chaptersContent.length !== 3) {
        this.logger.error(`Invalid number of chapters: ${chaptersContent.length}`);
        throw new Error('Invalid number of chapters content');
      }
      const totalWordCount = chaptersContent.reduce(
        (acc, content) => acc + content.split(' ').length,
        0,
      );
      if (totalWordCount < 1000) {
        this.logger.error(`Total word count too low: ${totalWordCount}`);
        throw new Error(
          'Total word count of chapters content is less than 1600',
        );
      }
      this.logger.debug(`Successfully generated ${chaptersContent.length} chapters with ${totalWordCount} total words`);
    } catch (error) {
      this.logger.error(`Error generating chapter content: ${error.message}`);
      if (retryNumber <= 10) {
        this.logger.warn(`Retrying chapter content generation (attempt ${retryNumber + 2})...`);
        return this.generateChaptersContent(storyId, retryNumber + 1);
      }
      throw error;
    }

    this.logger.log('Updating chapters with generated content...');
    for (const chapter of story.chapters) {
      this.logger.debug(`Processing chapter ${chapter.number}...`);
      const { background_sound } =
        await this.llmService.getChapterBackgroundSound(
          process.env.OLLAMA_CHAPTER_BACKGROUND_SOUND_MODEL,
          story.types.sound_prompt,
          chapter,
        );
      chapter.background_sound = background_sound;

      if (chapter.number === 1) {
        chapter.content = chaptersContent[0];
      } else if (chapter.number === 2) {
        chapter.content = chaptersContent[1];
      } else if (chapter.number === 3) {
        chapter.content = chaptersContent[2];
      }

      await this.prisma.chapters.update({
        where: { id: chapter.id },
        data: chapter,
      });
      this.logger.debug(`Updated chapter ${chapter.number} with content and background sound`);
    }

    this.logger.log(`Successfully completed chapter content generation for story ID: ${storyId}`);
    return story;
  }

  async generateChaptersMedia(storyId: number) {
    this.logger.log(`Starting media generation for story ID: ${storyId}`);
    const story = (await this.prisma.stories.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          orderBy: {
            number: 'asc',
          },
        },
        types: true,
      },
    })) as StoryWithRelations;

    const folderName = this.getFolderName(story);
    this.logger.debug(`Using folder name: ${folderName} for media generation`);

    for (const chapter of story.chapters) {
      this.logger.log(`Starting media generation for chapter ${chapter.number}...`);
      await this.genApiService
        .generateChapterMedia(chapter, folderName)
        .then(async (filesName) => {
          this.logger.debug(`Generated media files for chapter ${chapter.number}: ${JSON.stringify(filesName)}`);

          await this.prisma.chapters.update({
            where: { id: chapter.id },
            data: {
              video_url: `${folderName}/${filesName.videoFileName}`,
              audio_url: `${folderName}/${filesName.audioFileName}`,
            },
          });
          this.logger.debug(`Updated chapter ${chapter.number} with media URLs`);
        })
        .catch(error => {
          this.logger.error(`Error generating media for chapter ${chapter.number}: ${error.message}`);
          throw error;
        });
    }

    this.logger.log(`Successfully completed media generation for story ID: ${storyId}`);
    return story;
  }

  async generateStoryBackgroundImage(story: Partial<StoryDto>) {
    this.logger.log(`Starting background image generation for story ID: ${story.id}`);
    const folderName = this.getFolderName(story);
    const backgroundImageFilename = 'background-image.jpg';

    const backgroundImagePrompt = await this.typesService.getImagePrompt(
      story.types_id,
      story.image_prompt,
    );
    this.logger.debug(`Generated background image prompt: ${backgroundImagePrompt}`);

    this.logger.log('Generating background image...');
    await this.genApiService
      .generateImage(backgroundImagePrompt, folderName, backgroundImageFilename)
      .then(async () => {
        this.logger.debug('Background image generated successfully');
        await this.updateStory(story.id, {
          background_image: `${folderName}/${backgroundImageFilename}`,
        });
        this.logger.debug('Updated story with background image URL');
      })
      .catch(error => {
        this.logger.error(`Error generating background image: ${error.message}`);
        throw error;
      });

    this.logger.log(`Successfully completed background image generation for story ID: ${story.id}`);
  }

  async findAll(): Promise<StoryDto[]> {
    this.logger.log('Fetching all stories from database...');
    const stories = await this.prisma.stories.findMany({
      include: {
        chapters: true,
        types: true,
      },
    });
    this.logger.log(`Successfully fetched ${stories.length} stories from database`);
    return stories;
  }

  findAllByType(typeId: TypeDto['id']): Promise<StoryDto[]> {
    this.logger.debug(`Fetching all stories for type ID: ${typeId}`);
    return this.prisma.stories.findMany({
      where: { types_id: typeId },
    }) as Promise<StoryDto[]>;
  }


  async createStory(types_id: TypeDto['id']): Promise<StoryDto> {
    this.logger.log(`Starting story creation process for type ID: ${types_id}`);
    try {
      const types = await this.prisma.types.findUnique({
        where: { id: types_id },
      });

      if (!types) {
        this.logger.error(`Type with ID ${types_id} not found`);
        throw new NotFoundException(`Type with ID ${types_id} not found`);
      }

      this.logger.debug('Fetching existing stories for context...');
      const existingStories = await this.findAllByType(types_id);
      this.logger.debug(`Found ${existingStories.length} existing stories`);

      this.logger.log('Generating story info using LLM...');
      const storyInfo = await this.llmService.generateStoryInfo(
        process.env.OLLAMA_STORY_INFO_MODEL,
        types.story_prompt,
        existingStories,
      );

      if (!storyInfo) {
        this.logger.error('Failed to generate story info');
        throw new Error('Failed to generate story info');
      }

      this.logger.debug('Generating image prompt...');
      const imagePrompt = await this.llmService.generateStoryImagePrompt(
        process.env.OLLAMA_STORY_INFO_MODEL,
        storyInfo.title,
        storyInfo.synopsis,
      );

      this.logger.log('Creating story in database...');
      const story = await this.prisma.stories.create({
        data: {
          name: storyInfo.title,
          synopsis: storyInfo.synopsis,
          image_prompt: imagePrompt,
          types: {
            connect: {
              id: types_id,
            },
          },
        },
      });

      this.logger.debug('Creating chapters...');
      const chapters = [
        {
          number: 1,
          title: storyInfo.chapterOneTitle,
          summary: storyInfo.chapterOneSummary,
        },
        {
          number: 2,
          title: storyInfo.chapterTwoTitle,
          summary: storyInfo.chapterTwoSummary,
        },
        {
          number: 3,
          title: storyInfo.chapterThreeTitle,
          summary: storyInfo.chapterThreeSummary,
        },
      ];

      for (const chapter of chapters) {
        this.logger.debug(`Creating chapter ${chapter.number}...`);
        await this.prisma.chapters.create({
          data: {
            ...chapter,
            stories_id: story.id,
          },
        });
      }

      this.logger.log(`Successfully completed story creation process for story ID: ${story.id}`);
      return this.findOne(story.id);
    } catch (error) {
      this.logger.error(`Error in createStory: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<StoryDto> {
    this.logger.log(`Fetching story with ID: ${id} from database...`);
    const story = await this.prisma.stories.findUnique({
      where: { id },
      include: {
        chapters: true,
        types: true,
      },
    });
    if (!story) {
      this.logger.warn(`Story with ID: ${id} not found in database`);
      throw new NotFoundException(`Story with ID: ${id} not found`);
    }
    this.logger.log(`Successfully fetched story with ID: ${id} from database`);
    return story;
  }

  async generateFullStoryMedia(id: number): Promise<StoryDto> {
    this.logger.log(`Starting full story media generation for story ID: ${id}...`);
    const story = (await this.prisma.stories.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: {
            number: 'asc',
          },
        },
        types: true,
      },
    })) as StoryWithRelations;

    if (!story) {
      this.logger.error(`Story with ID: ${id} not found for full media generation`);
      throw new NotFoundException(`Story with ID: ${id} not found`);
    }

    const folderName = this.getFolderName(story);
    this.logger.debug(`Using folder name: ${folderName} for media generation`);

    this.logger.log('Generating story media...');
    const filesName = await this.genApiService.generateStoryMedia(
      story,
      folderName,
      story.background_image,
    );
    this.logger.debug(`Generated media files: ${JSON.stringify(filesName)}`);

    this.logger.log('Updating story with media URLs...');
    await this.prisma.stories.update({
      where: { id: story.id },
      data: {
        video_url: `${folderName}/${filesName.videoFileName}`,
        audio_url: `${folderName}/${filesName.audioFileName}`,
        thumbnail_url: `${folderName}/thumbnail.jpg`,
      },
    });

    this.logger.log(`Successfully completed full story media generation for story ID: ${id}`);
    return this.findOne(id);
  }

  findOneStory(storyId: number) {
    this.logger.debug(`Fetching single story with ID: ${storyId}`);
    return this.prisma.stories.findFirst({
      where: { id: storyId },
      include: {
        chapters: true,
        types: true,
      },
    });
  }

  updateStory(storyId: number, data: any) {
    this.logger.debug(`Updating story ${storyId} with data: ${JSON.stringify(data)}`);
    return this.prisma.stories.update({
      where: { id: storyId },
      data,
    });
  }

  async createAndGenerateFullStory(typeId: number): Promise<StoryDto> {
    this.logger.log('Starting full story creation and generation process...');

    // Step 1: Create new story with basic info
    this.logger.log('Step 1: Creating new story...');
    const story = await this.createStory(typeId);
    this.logger.debug(`Created story with ID: ${story.id}`);

    // Step 2: Generate background image
    this.logger.log('Step 2: Generating background image...');
    await this.generateStoryBackgroundImage(story);
    this.logger.debug('Background image generated successfully');

    // Step 3: Generate chapters content
    this.logger.log('Step 3: Generating chapters content...');
    await this.generateChaptersContent(story.id);
    this.logger.debug('Chapters content generated successfully');

    // Step 4: Generate chapters media
    this.logger.log('Step 4: Generating chapters media...');
    await this.generateChaptersMedia(story.id);
    this.logger.debug('Chapters media generated successfully');

    // Step 5: Generate full story media
    this.logger.log('Step 5: Generating full story media...');
    await this.generateFullStoryMedia(story.id);
    this.logger.debug('Full story media generated successfully');

    this.logger.log(`Successfully completed full story creation and generation process for story ID: ${story.id}`);
    return this.findOne(story.id);
  }
}
