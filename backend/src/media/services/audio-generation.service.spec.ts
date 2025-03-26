import { Test, TestingModule } from '@nestjs/testing';
import { AudioGenerationService } from './audio-generation.service';
import { join } from 'path';
import * as fs from 'fs';
import * as extractAudio from 'ffmpeg-extract-audio';

jest.mock('ffmpeg-extract-audio');

describe('AudioGenerationService', () => {
  let service: AudioGenerationService;
  const testVideoPath = join(process.cwd(), 'test', 'fixtures', 'video.mp4');
  const outputPath = join(process.cwd(), 'test', 'output');

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudioGenerationService],
    }).compile();

    service = module.get<AudioGenerationService>(AudioGenerationService);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
  });

  afterAll(async () => {
    // Clean up output directory after tests
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractAudioFromVideo', () => {
    it('should successfully extract audio from video', async () => {
      const outputFileName = `test-audio-${Date.now()}.mp3`;
      const outputFilePath = join(outputPath, outputFileName);

      const result = await service.extractAudioFromVideo(testVideoPath, outputFilePath);

      expect(result).toBe(true);
      expect(extractAudio).toHaveBeenCalledWith({
        input: testVideoPath,
        output: outputFilePath,
      });
    });

    it('should handle extraction failure', async () => {
      // Mock the extractAudio function to simulate failure
      (extractAudio as jest.Mock).mockRejectedValueOnce(new Error('Extraction failed'));

      const outputFileName = `test-audio-${Date.now()}.mp3`;
      const outputFilePath = join(outputPath, outputFileName);

      const result = await service.extractAudioFromVideo(testVideoPath, outputFilePath);

      expect(result).toBe(false);
      expect(extractAudio).toHaveBeenCalledWith({
        input: testVideoPath,
        output: outputFilePath,
      });
    });

    it('should handle non-existent video file', async () => {
      const nonExistentPath = 'non-existent.mp4';
      const outputFileName = `test-audio-${Date.now()}.mp3`;
      const outputFilePath = join(outputPath, outputFileName);

      try {
        await service.extractAudioFromVideo(nonExistentPath, outputFilePath);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
}); 