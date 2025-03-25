import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LLMService } from '../llm/llm.service';
import { PrismaService } from '../prisma/prisma.service';
import { TypeDto } from '../types/dto/type.dto';
import { StoryDto } from './dto/story.dto';
import { TypesService } from '../types/types.service';
import { GenApiService } from '../gen_api/gen_api.service';
import { Prisma } from '@prisma/client';

type StoryWithRelations = Prisma.storiesGetPayload<{
  include: {
    chapters: true;
    types: true;
    publishings: true;
  };
}>;

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly typesService: TypesService,
    private readonly genApiService: GenApiService,
  ) {}

  getFolderName(story: Partial<StoryDto>) {
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
      chaptersContent = await this.llmService.generateChapterContent(
        process.env.OLLAMA_CHAPTER_CONTENT_MODEL,
        story.types.chapter_prompt,
        story as unknown as StoryDto,
      );
      if (chaptersContent.length !== 3) {
        console.error(`Number of chapters ${chaptersContent.length}`);
        throw new Error('Invalid number of chapters content');
      }
      const totalWordCount = chaptersContent.reduce(
        (acc, content) => acc + content.split(' ').length,
        0,
      );
      if (totalWordCount < 1000) {
        throw new Error(
          'Total word count of chapters content is less than 1600',
        );
      }
    } catch (error) {
      console.error('Error generating chapter content: ', error);
      if (retryNumber <= 10) {
        console.error('Retrying...');
        return this.generateChaptersContent(storyId, retryNumber + 1);
      }
    }
    for (const chapter of story.chapters) {
      const { background_sound } =
        await this.llmService.getChapterBackgroundSound(
          process.env.OLLAMA_STORY_INFO_MODEL,
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
    }

    return story;
  }

  async generateChaptersMedia(storyId: number) {
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
    for (const chapter of story.chapters) {
      this.logger.log(`Chapter ${chapter.number} generation...`);
      await this.genApiService
        .generateChapterMedia(chapter, folderName)
        .then(async (filesName) => {
          this.logger.log(`Chapter ${chapter.number} media generated.`);

          await this.prisma.chapters.update({
            where: { id: chapter.id },
            data: {
              video_url: `${folderName}/${filesName.videoFileName}`,
              audio_url: `${folderName}/${filesName.audioFileName}`,
            },
          });
        });
    }

    return story;
  }

  async generateStoryBackgroundImage(story: Partial<StoryDto>) {
    const folderName = this.getFolderName(story);
    const backgroundImageFilename = 'background-image.jpg';

    const backgroundImagePrompt = await this.typesService.getImagePrompt(
      story.types_id,
      story.image_prompt,
    );
    this.logger.log('Generating background image ...');
    await this.genApiService
      .generateImage(backgroundImagePrompt, folderName, backgroundImageFilename)
      .then(async () => {
        this.logger.log('Background image generated.');
        await this.updateStory(story.id, {
          background_image: `${folderName}/${backgroundImageFilename}`,
        });
        this.logger.log('Story updated.');
      });
  }

  findAll() {
    return this.prisma.stories.findMany({
      include: {
        types: true,
        chapters: true,
        publishings: true,
      },
    });
  }

  findAllByType(typeId: TypeDto['id']): Promise<StoryDto[]> {
    return this.prisma.stories.findMany({
      where: { types_id: typeId },
    }) as Promise<StoryDto[]>;
  }

  async createStory(types_id: TypeDto['id']): Promise<Partial<StoryDto>> {
    const types = await this.prisma.types.findUnique({
      where: { id: types_id },
    });
    const existingStories = await this.findAllByType(types_id);
    const storyInfo = await this.llmService.generateStoryInfo(
      process.env.OLLAMA_STORY_INFO_MODEL,
      types.story_prompt,
      existingStories,
    );
    const imagePrompt = await this.llmService.generateStoryImagePrompt(
      process.env.OLLAMA_STORY_INFO_MODEL,
      storyInfo.title,
      storyInfo.synopsis,
    );

    // First create the story
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

    // Then create the chapters one by one
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
      await this.prisma.chapters.create({
        data: {
          ...chapter,
          stories_id: story.id,
        },
      });
    }

    return story;
  }

  async create(typeId: number): Promise<StoryDto> {
    const type = await this.prisma.types.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      throw new NotFoundException(`Type with ID ${typeId} not found`);
    }

    try {
      // Use createStory which handles the story and chapters creation properly
      const story = await this.createStory(typeId);

      // Return the complete story with chapters
      return this.findOne(story.id);
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<StoryDto> {
    const story = await this.prisma.stories.findUnique({
      where: { id },
      include: {
        types: true,
        chapters: true,
        publishings: true,
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found`);
    }

    return story;
  }

  async generateChapterContent(id: number): Promise<StoryDto> {
    const story = await this.findOne(id);

    await Promise.all(
      story.chapters.map(async (chapter) => {
        const content = await this.llmService.generateChapterContent(
          process.env.OLLAMA_CHAPTER_CONTENT_MODEL,
          story.types.chapter_prompt,
          story,
        );

        const backgroundSound = await this.llmService.getChapterBackgroundSound(
          process.env.OLLAMA_CHAPTER_CONTENT_MODEL,
          story.types.sound_prompt,
          chapter,
        );

        return this.prisma.chapters.update({
          where: { id: chapter.id },
          data: {
            content: content[chapter.number - 1],
            background_sound: backgroundSound.sound,
          },
        });
      }),
    );

    const updatedStory = await this.prisma.stories.findUnique({
      where: { id },
      include: {
        types: true,
        chapters: true,
        publishings: true,
      },
    });

    return updatedStory;
  }

  async generateFullStoryMedia(id: number): Promise<StoryDto> {
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

    const folderName = this.getFolderName(story);
    const filesName = await this.genApiService.generateStoryMedia(
      story,
      folderName,
      story.background_image,
    );

    await this.prisma.stories.update({
      where: { id: story.id },
      data: {
        video_url: `${folderName}/${filesName.videoFileName}`,
        audio_url: `${folderName}/${filesName.audioFileName}`,
        thumbnail_url: `${folderName}/thumbnail.jpg`,
      },
    });

    return story;
  }

  findOneStory(storyId: number) {
    return this.prisma.stories.findFirst({
      where: { id: storyId },
      include: {
        chapters: true,
        types: true,
      },
    });
  }

  updateStory(storyId: number, data: any) {
    return this.prisma.stories.update({
      where: { id: storyId },
      data,
    });
  }

  async createAndGenerateFullStory(typeId: number): Promise<StoryDto> {
    this.logger.log('Starting story creation and generation process...');

    // Step 1: Create new story with basic info
    this.logger.log('Step 1: Creating new story...');
    const story = await this.create(typeId);

    // Step 2: Generate background image
    this.logger.log('Step 2: Generating background image...');
    await this.generateStoryBackgroundImage(story);

    // Step 3: Generate chapters content
    this.logger.log('Step 3: Generating chapters content...');
    await this.generateChaptersContent(story.id);

    // Step 4: Generate chapters media
    this.logger.log('Step 4: Generating chapters media...');
    await this.generateChaptersMedia(story.id);

    // Step 5: Generate full story media
    this.logger.log('Step 5: Generating full story media...');
    await this.generateFullStoryMedia(story.id);

    this.logger.log(
      'Story creation and generation process completed successfully!',
    );
    return this.findOne(story.id);
  }
}
