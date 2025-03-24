import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import { join } from 'path';
import { ChapterDto } from 'src/chapters/dto/chapter.dto';
import { LLMService } from 'src/llm/llm.service';
import { StoryDto } from 'src/stories/dto/story.dto';

const extractAudio = require('ffmpeg-extract-audio')

@Injectable()
export class GenApiService {
  constructor(private readonly llmService: LLMService) { }
  async pingGenApi() {
    const response = await axios.get(`${process.env.GEN_API_URL}`);
    return response.data;
  }

  async generateImage(prompt: string, folderName: string, filename: string, width = 1920, height = 1080) {
    const directoryPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName);
    const filePath = join(directoryPath, filename);

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const response = await axios.post(`${process.env.GEN_API_URL}/generate-image`, {
      prompt,
      filename,
      width,
      height
    }, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const buffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync(filePath, buffer);
  }

  async generateThumbnail(folderName: string, storyName: string, storyType: string, backgroundImage: string, fileName = 'thumbnail.jpg') {
    const directoryPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName);
    const filePath = join(directoryPath, fileName);

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const imagePath = join(directoryPath, '..', backgroundImage);
    const imageStream = fs.readFileSync(imagePath);
    const formData = new FormData();

    formData.append('brand', 'The Daily Tale: Dark Chronicles');
    formData.append('title', storyName);
    formData.append('type', storyType);
    formData.append('filename', fileName);
    formData.append('image', new Blob([imageStream]), backgroundImage);

    const response = await axios.post(`${process.env.GEN_API_URL}/generate-thumbnail  `, formData, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const buffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync(filePath, buffer);
  }

  async generateChapterMedia(chapter: ChapterDto, folderName: string): Promise<{ audioFileName: string; videoFileName: string }> {
    const directoryPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName);
    const fileName = `chapter_${chapter.number}`;

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const backgroundImageFileName = 'background-image.jpg';
    const backgroundImagePath = join(directoryPath, backgroundImageFileName);
    const backgroundImageStream = fs.readFileSync(backgroundImagePath);
    const videoFileName = fileName + '.mp4';
    const videoPath = join(directoryPath, videoFileName);
    const audioFileName = fileName + '.mp3';
    const audioPath = join(directoryPath, audioFileName);

    const formData = new FormData();
    formData.append('title', 'Chapter ' + chapter.number);
    formData.append('chapter', chapter.title);
    formData.append('content', chapter.content);
    formData.append('filename', videoFileName);
    formData.append('background_sound', chapter.background_sound);
    formData.append('background_image', new Blob([backgroundImageStream]), 'background_image.jpg');

    const response = await axios.post(`${process.env.GEN_API_URL}/generate-chapter`, formData, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const buffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync(videoPath, buffer);

    await extractAudio({
      input: videoPath,
      output: audioPath
    })

    return { audioFileName, videoFileName };
  }

  async generateStoryMedia(story: StoryDto, folderName: string, backgroundImage: string): Promise<{ audioFileName: string; videoFileName: string; thumbnailFileName: string }> {
    const directoryPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName);
    const fileName = 'full_story';

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const chapter1Path = join(directoryPath, 'chapter_1.mp4');
    const chapter1Stream = fs.readFileSync(chapter1Path);
    const chapter2Path = join(directoryPath, 'chapter_2.mp4');
    const chapter2Stream = fs.readFileSync(chapter2Path);
    const chapter3Path = join(directoryPath, 'chapter_3.mp4');
    const chapter3Stream = fs.readFileSync(chapter3Path);

    const videoFileName = fileName + '.mp4';
    const videoPath = join(directoryPath, videoFileName);
    const audioFileName = fileName + '.mp3';
    const audioPath = join(directoryPath, audioFileName);
    const thumbnailFileName = 'thumbnail.jpg';

    const formData = new FormData();
    formData.append('title', story.name);
    formData.append('filename', videoFileName);
    formData.append('type', story.types.name);
    formData.append('chapter_1', new Blob([chapter1Stream]), 'chapter_1.mp4');
    formData.append('chapter_2', new Blob([chapter2Stream]), 'chapter_2.mp4');
    formData.append('chapter_3', new Blob([chapter3Stream]), 'chapter_3.mp4');

    const response = await axios.post(`${process.env.GEN_API_URL}/generate-full-story`, formData, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const buffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync(videoPath, buffer);

    await extractAudio({
      input: videoPath,
      output: audioPath
    })

    await this.generateThumbnail(folderName, story.name, story.types.name, backgroundImage, thumbnailFileName);

    for (const chapter of story.chapters) {
      await this.generateStoryShortMedia(chapter, folderName, backgroundImage);
    }

    return { audioFileName, videoFileName, thumbnailFileName };
  }

  async generateStoryShortMedia(chapter: ChapterDto, folderName: string, backgroundImage: string): Promise<{ videoFileName: string }> {
    const directoryPath = join(__dirname, '..', '..', '..', 'public', 'generation', folderName);
    const videoFileName = `short_${chapter.number}.mp4`;
    const videoPath = join(directoryPath, videoFileName);
    const backgroundImagePath = join(directoryPath, '..', backgroundImage);
    const backgroundImageStream = fs.readFileSync(backgroundImagePath);

    const shortContentText = await this.llmService.generateChapterExceptForShort(process.env.OLLAMA_STORY_INFO_MODEL, chapter.content);

    const formData = new FormData();
    formData.append('background_image', new Blob([backgroundImageStream]), backgroundImage);
    formData.append('filename', videoFileName);
    formData.append('text', shortContentText);
    formData.append('type', 'Horror');

    const response = await axios.post(`${process.env.GEN_API_URL}/generate-short`, formData, {
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const buffer = Buffer.from(response.data, 'binary');
    fs.writeFileSync(videoPath, buffer);

    return { videoFileName };
  }
}
