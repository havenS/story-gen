import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChapterDto } from 'src/chapters/dto/chapter.dto';
import { StoryDto } from 'src/stories/dto/story.dto';
import { FileSystemService } from '../media/services/file-system.service';
import { ImageGenerationService } from '../media/services/image-generation.service';
import { VideoGenerationService } from '../media/services/video-generation.service';
import { AudioGenerationService } from '../media/services/audio-generation.service';
import { ConfigurationService } from '../config/configuration.service';

@Injectable()
export class GenApiService {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly imageGenerationService: ImageGenerationService,
    private readonly videoGenerationService: VideoGenerationService,
    private readonly audioGenerationService: AudioGenerationService,
    private readonly configService: ConfigurationService,
  ) {}

  async pingGenApi() {
    const response = await axios.get(`${this.configService.getGenApiUrl()}`);
    return response.data;
  }

  async generateImage(
    prompt: string,
    folderName: string,
    filename: string,
    width = 1920,
    height = 1080,
  ) {
    const directoryPath = this.fileSystemService.buildPath(
      __dirname,
      '..',
      '..',
      '..',
      this.configService.getPublicDir(),
      this.configService.getGenerationDir(),
      folderName,
    );
    const filePath = this.fileSystemService.buildPath(directoryPath, filename);

    await this.fileSystemService.ensureDirectoryExists(directoryPath);

    const response = await this.imageGenerationService.generateImage({
      prompt,
      filename,
      width,
      height,
    });

    if (response.success && response.data) {
      await this.fileSystemService.writeFile(filePath, response.data);
    } else {
      throw new Error(response.error || 'Failed to generate image');
    }
  }

  async generateThumbnail(
    folderName: string,
    storyName: string,
    storyType: string,
    backgroundImage: string,
    fileName = 'thumbnail.jpg',
  ) {
    const directoryPath = this.fileSystemService.buildPath(
      __dirname,
      '..',
      '..',
      '..',
      this.configService.getPublicDir(),
      this.configService.getGenerationDir(),
      folderName,
    );
    const filePath = this.fileSystemService.buildPath(directoryPath, fileName);
    const imagePath = this.fileSystemService.buildPath(
      directoryPath,
      '..',
      backgroundImage,
    );

    await this.fileSystemService.ensureDirectoryExists(directoryPath);

    const imageStream = await this.fileSystemService.readFile(imagePath);
    const response = await this.imageGenerationService.generateThumbnail({
      brand: 'The Daily Tale: Dark Chronicles',
      title: storyName,
      type: storyType,
      filename: fileName,
      image: new Blob([imageStream]),
    });

    if (response.success && response.data) {
      await this.fileSystemService.writeFile(filePath, response.data);
    } else {
      throw new Error(response.error || 'Failed to generate thumbnail');
    }
  }

  async generateChapterMedia(
    chapter: ChapterDto,
    folderName: string,
  ): Promise<{ audioFileName: string; videoFileName: string }> {
    const directoryPath = this.fileSystemService.buildPath(
      __dirname,
      '..',
      '..',
      '..',
      this.configService.getPublicDir(),
      this.configService.getGenerationDir(),
      folderName,
    );
    const fileName = `chapter_${chapter.number}`;
    const videoFileName = fileName + '.mp4';
    const videoPath = this.fileSystemService.buildPath(
      directoryPath,
      videoFileName,
    );
    const audioFileName = fileName + '.mp3';
    const audioPath = this.fileSystemService.buildPath(
      directoryPath,
      audioFileName,
    );

    await this.fileSystemService.ensureDirectoryExists(directoryPath);

    const backgroundImageFileName = 'background-image.jpg';
    const backgroundImagePath = this.fileSystemService.buildPath(
      directoryPath,
      backgroundImageFileName,
    );
    const backgroundImageStream =
      await this.fileSystemService.readFile(backgroundImagePath);

    const response = await this.videoGenerationService.generateChapterVideo(
      chapter,
      backgroundImageStream,
    );

    if (response.success && response.data) {
      await this.fileSystemService.writeFile(videoPath, response.data);
      await this.audioGenerationService.extractAudioFromVideo(
        videoPath,
        audioPath,
      );
      return { audioFileName, videoFileName };
    } else {
      throw new Error(response.error || 'Failed to generate chapter media');
    }
  }

  async generateStoryMedia(
    story: StoryDto,
    folderName: string,
    backgroundImage: string,
  ): Promise<{
    audioFileName: string;
    videoFileName: string;
    thumbnailFileName: string;
  }> {
    const directoryPath = this.fileSystemService.buildPath(
      __dirname,
      '..',
      '..',
      '..',
      this.configService.getPublicDir(),
      this.configService.getGenerationDir(),
      folderName,
    );
    const fileName = 'full_story';
    const videoFileName = fileName + '.mp4';
    const videoPath = this.fileSystemService.buildPath(
      directoryPath,
      videoFileName,
    );
    const audioFileName = fileName + '.mp3';
    const audioPath = this.fileSystemService.buildPath(
      directoryPath,
      audioFileName,
    );
    const thumbnailFileName = 'thumbnail.jpg';

    await this.fileSystemService.ensureDirectoryExists(directoryPath);

    const chapter1Path = this.fileSystemService.buildPath(
      directoryPath,
      'chapter_1.mp4',
    );
    const chapter2Path = this.fileSystemService.buildPath(
      directoryPath,
      'chapter_2.mp4',
    );
    const chapter3Path = this.fileSystemService.buildPath(
      directoryPath,
      'chapter_3.mp4',
    );

    const chapter1Stream = await this.fileSystemService.readFile(chapter1Path);
    const chapter2Stream = await this.fileSystemService.readFile(chapter2Path);
    const chapter3Stream = await this.fileSystemService.readFile(chapter3Path);

    const response = await this.videoGenerationService.generateStoryVideo(
      story,
      [chapter1Stream, chapter2Stream, chapter3Stream],
    );

    if (response.success && response.data) {
      await this.fileSystemService.writeFile(videoPath, response.data);
      await this.audioGenerationService.extractAudioFromVideo(
        videoPath,
        audioPath,
      );
      await this.generateThumbnail(
        folderName,
        story.name,
        story.types.name,
        backgroundImage,
        thumbnailFileName,
      );

      for (const chapter of story.chapters) {
        await this.generateStoryShortMedia(
          chapter,
          folderName,
          backgroundImage,
        );
      }

      return { audioFileName, videoFileName, thumbnailFileName };
    } else {
      throw new Error(response.error || 'Failed to generate story media');
    }
  }

  async generateStoryShortMedia(
    chapter: ChapterDto,
    folderName: string,
    backgroundImage: string,
  ): Promise<{ videoFileName: string }> {
    const directoryPath = this.fileSystemService.buildPath(
      __dirname,
      '..',
      '..',
      '..',
      this.configService.getPublicDir(),
      this.configService.getGenerationDir(),
      folderName,
    );
    const videoFileName = `short_${chapter.number}.mp4`;
    const videoPath = this.fileSystemService.buildPath(
      directoryPath,
      videoFileName,
    );
    const backgroundImagePath = this.fileSystemService.buildPath(
      directoryPath,
      '..',
      backgroundImage,
    );

    await this.fileSystemService.ensureDirectoryExists(directoryPath);

    const backgroundImageStream =
      await this.fileSystemService.readFile(backgroundImagePath);

    const response = await this.videoGenerationService.generateShortVideo(
      chapter,
      backgroundImageStream,
    );

    if (response.success && response.data) {
      await this.fileSystemService.writeFile(videoPath, response.data);
      return { videoFileName };
    } else {
      throw new Error(response.error || 'Failed to generate story short media');
    }
  }
}
