import { Test, TestingModule } from '@nestjs/testing';
import { TypesService } from './types.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TypesService', () => {
  let service: TypesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    types: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TypesService>(TypesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getImagePrompt', () => {
    it('should combine synopsis and image prompt template', async () => {
      const mockType = {
        id: 1,
        image_prompt: 'Create an image with {synopsis}',
      };

      mockPrismaService.types.findFirst.mockResolvedValue(mockType);

      const synopsis = 'A beautiful sunset over mountains';
      const result = await service.getImagePrompt(1, synopsis);

      expect(result).toBe('A beautiful sunset over mountains|Create an image with {synopsis}');
      expect(mockPrismaService.types.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
