import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.types.findMany();
  }

  findOne(id: number) {
    return this.prisma.types.findFirstOrThrow({
      where: { id },
    });
  }

  async getTypeStories(id: number) {
    const type = await this.prisma.types.findFirst({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException('Type not found');
    }

    return this.prisma.stories.findMany({
      where: { types_id: id },
      include: { chapters: true, publishings: true },
    });
  }

  async getImagePrompt(id: number, synopsis: string) {
    const type = await this.prisma.types.findFirst({
      where: { id },
    });

    const promptTemplate = type.image_prompt;

    return `${synopsis}|${promptTemplate}`;
  }

  findOneType(id: number) {
    return this.prisma.types.findFirst({
      where: { id },
    });
  }
}
