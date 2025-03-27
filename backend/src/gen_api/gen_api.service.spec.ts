import { Test, TestingModule } from '@nestjs/testing';
import { GenApiService } from './gen_api.service';
import { FileSystemService } from '../media/services/file-system.service';
import { ImageGenerationService } from '../media/services/image-generation.service';
import { VideoGenerationService } from '../media/services/video-generation.service';
import { AudioGenerationService } from '../media/services/audio-generation.service';
import { ConfigurationService } from '../config/configuration.service';

describe('GenApiService', () => {
  let service: GenApiService;

  const mockFileSystemService = {
    buildPath: jest.fn(),
    ensureDirectoryExists: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
  };

  const mockImageGenerationService = {
    generateImage: jest.fn(),
    generateThumbnail: jest.fn(),
  };

  const mockVideoGenerationService = {
    generateChapterVideo: jest.fn(),
    generateStoryVideo: jest.fn(),
    generateStoryShortVideo: jest.fn(),
  };

  const mockAudioGenerationService = {
    extractAudioFromVideo: jest.fn(),
  };

  const mockConfigurationService = {
    getGenApiUrl: jest.fn(),
    getPublicDir: jest.fn(),
    getGenerationDir: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenApiService,
        {
          provide: FileSystemService,
          useValue: mockFileSystemService,
        },
        {
          provide: ImageGenerationService,
          useValue: mockImageGenerationService,
        },
        {
          provide: VideoGenerationService,
          useValue: mockVideoGenerationService,
        },
        {
          provide: AudioGenerationService,
          useValue: mockAudioGenerationService,
        },
        {
          provide: ConfigurationService,
          useValue: mockConfigurationService,
        },
      ],
    }).compile();

    service = module.get<GenApiService>(GenApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateImage', () => {
    it('should generate an image successfully', async () => {
      const prompt = 'test prompt';
      const folderName = 'test-folder';
      const filename = 'test-image.jpg';
      const mockResponse = {
        success: true,
        data: Buffer.from('test-image-data'),
      };

      mockConfigurationService.getPublicDir.mockReturnValue('public');
      mockConfigurationService.getGenerationDir.mockReturnValue('generation');
      mockFileSystemService.buildPath.mockReturnValue('test-path');
      mockImageGenerationService.generateImage.mockResolvedValue(mockResponse);

      await service.generateImage(prompt, folderName, filename);

      expect(mockFileSystemService.ensureDirectoryExists).toHaveBeenCalled();
      expect(mockImageGenerationService.generateImage).toHaveBeenCalledWith({
        prompt,
        filename,
        width: 1920,
        height: 1080,
      });
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        'test-path',
        mockResponse.data,
      );
    });
  });

  describe('generateThumbnail', () => {
    it('should generate a thumbnail successfully', async () => {
      const folderName = 'test-folder';
      const storyName = 'Test Story';
      const storyType = 'Horror';
      const backgroundImage = 'background.jpg';
      const fileName = 'thumbnail.jpg';
      const mockResponse = {
        success: true,
        data: Buffer.from('test-thumbnail-data'),
      };

      mockConfigurationService.getPublicDir.mockReturnValue('public');
      mockConfigurationService.getGenerationDir.mockReturnValue('generation');
      mockFileSystemService.buildPath.mockReturnValue('test-path');
      mockFileSystemService.readFile.mockResolvedValue(
        Buffer.from('test-image-data'),
      );
      mockImageGenerationService.generateThumbnail.mockResolvedValue(
        mockResponse,
      );

      await service.generateThumbnail(
        folderName,
        storyName,
        storyType,
        backgroundImage,
        fileName,
      );

      expect(mockFileSystemService.ensureDirectoryExists).toHaveBeenCalled();
      expect(mockImageGenerationService.generateThumbnail).toHaveBeenCalledWith(
        {
          brand: 'The Daily Tale: Dark Chronicles',
          title: storyName,
          type: storyType,
          filename: fileName,
          image: expect.any(Blob),
        },
      );
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        'test-path',
        mockResponse.data,
      );
    });
  });
});
