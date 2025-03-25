import { Test, TestingModule } from '@nestjs/testing';
import { PublishingService } from './publishing.service';
import { PrismaService } from '../prisma/prisma.service';
import { PublishingDto } from './dto/publishing.dto';

describe('PublishingService', () => {
  let service: PublishingService;

  const mockPrismaService = {
    publishing: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PublishingService>(PublishingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOnePublishing', () => {
    it('should return a publishing by id', async () => {
      const mockPublishing: PublishingDto = {
        id: 1,
        story_id: 1,
        title: 'Test Story',
        description: 'Test Description',
        tags: ['test'],
        youtube_id: 'test123',
        patreon_published: false,
      };

      mockPrismaService.publishing.findUnique.mockResolvedValue(mockPublishing);

      const result = await service.findOnePublishing(1);

      expect(result).toEqual(mockPublishing);
      expect(mockPrismaService.publishing.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if publishing not found', async () => {
      mockPrismaService.publishing.findUnique.mockResolvedValue(null);

      const result = await service.findOnePublishing(999);

      expect(result).toBeNull();
      expect(mockPrismaService.publishing.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('updatePublishing', () => {
    it('should update a publishing', async () => {
      const mockPublishing: PublishingDto = {
        id: 1,
        story_id: 1,
        title: 'Test Story',
        description: 'Test Description',
        tags: ['test'],
        youtube_id: 'test123',
        patreon_published: false,
      };

      const updateData = {
        youtube_id: 'new123',
      };

      const expectedResult = {
        ...mockPublishing,
        ...updateData,
      };

      mockPrismaService.publishing.update.mockResolvedValue(expectedResult);

      const result = await service.updatePublishing(1, updateData);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.publishing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });

  describe('createPublishing', () => {
    it('should create a new publishing', async () => {
      const createData: Omit<PublishingDto, 'id'> = {
        story_id: 1,
        title: 'New Story',
        description: 'New Description',
        tags: ['new'],
        youtube_id: 'new123',
        patreon_published: false,
      };

      const expectedResult: PublishingDto = {
        id: 1,
        story_id: 1,
        ...createData,
      } as PublishingDto;

      mockPrismaService.publishing.create.mockResolvedValue(expectedResult);

      const result = await service.createPublishing(createData);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.publishing.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });
});
