import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigurationService } from '../../config/configuration.service';
import { MediaGenerationResponse } from '../types/media.types';
import { ChapterDto } from '../../chapters/dto/chapter.dto';
import { StoryDto } from '../../stories/dto/story.dto';
import { LLMService } from '../../llm/llm.service';

@Injectable()
export class VideoGenerationService {
  private readonly logger = new Logger(VideoGenerationService.name);

  constructor(
    private readonly configService: ConfigurationService,
    private readonly llmService: LLMService,
  ) {}

  async generateChapterVideo(
    chapter: ChapterDto,
    backgroundImage: Buffer,
  ): Promise<MediaGenerationResponse> {
    try {
      const formData = new FormData();
      formData.append('title', `Chapter ${chapter.number}`);
      formData.append('chapter', chapter.title);
      formData.append('content', chapter.content);
      formData.append('filename', `chapter_${chapter.number}.mp4`);
      formData.append('background_sound', chapter.background_sound);
      formData.append(
        'background_image',
        new Blob([backgroundImage]),
        'background_image.jpg',
      );

      const response = await axios.post(
        `${this.configService.getGenApiUrl()}/generate-chapter`,
        formData,
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return {
        success: true,
        data: Buffer.from(response.data, 'binary'),
      };
    } catch (error) {
      this.logger.error(`Failed to generate chapter video: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateStoryVideo(
    story: StoryDto,
    chapterVideos: Buffer[],
  ): Promise<MediaGenerationResponse> {
    try {
      const formData = new FormData();
      formData.append('title', story.name);
      formData.append('filename', 'full_story.mp4');
      formData.append('type', story.types.name);

      chapterVideos.forEach((video, index) => {
        formData.append(
          `chapter_${index + 1}`,
          new Blob([video]),
          `chapter_${index + 1}.mp4`,
        );
      });

      const response = await axios.post(
        `${this.configService.getGenApiUrl()}/generate-full-story`,
        formData,
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return {
        success: true,
        data: Buffer.from(response.data, 'binary'),
      };
    } catch (error) {
      this.logger.error(`Failed to generate story video: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateShortVideo(
    chapter: ChapterDto,
    backgroundImage: Buffer,
  ): Promise<MediaGenerationResponse> {
    try {
      const shortContentText =
        await this.llmService.generateChapterExceptForShort(
          this.configService.getOllamaStoryInfoModel(),
          chapter.content,
        );

      const formData = new FormData();
      formData.append(
        'background_image',
        new Blob([backgroundImage]),
        'background_image.jpg',
      );
      formData.append('filename', `short_${chapter.number}.mp4`);
      formData.append('text', shortContentText);
      formData.append('type', 'Horror');

      const response = await axios.post(
        `${this.configService.getGenApiUrl()}/generate-short`,
        formData,
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return {
        success: true,
        data: Buffer.from(response.data, 'binary'),
      };
    } catch (error) {
      this.logger.error(`Failed to generate short video: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
