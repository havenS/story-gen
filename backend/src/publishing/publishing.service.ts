import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublishingDto } from './dto/publishing.dto';
import { CreatePublishingDto } from './dto/createPublishing.dto';

@Injectable()
export class PublishingService {
  constructor(private prisma: PrismaService) {}

  async findOnePublishing(storyId: number): Promise<PublishingDto | null> {
    return this.prisma.publishing.findFirst({
      where: { story_id: storyId },
    });
  }

  async updatePublishing(
    id: number,
    data: Partial<Omit<PublishingDto, 'id'>>,
  ): Promise<PublishingDto> {
    return this.prisma.publishing.update({
      where: { id },
      data,
    });
  }

  async createPublishing(data: CreatePublishingDto): Promise<PublishingDto> {
    return this.prisma.publishing.create({
      data,
    });
  }
}
