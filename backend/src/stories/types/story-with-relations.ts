import { Prisma } from '@prisma/client';

export type StoryWithRelations = Prisma.storiesGetPayload<{
  include: {
    chapters: true;
    types: true;
  };
}>; 