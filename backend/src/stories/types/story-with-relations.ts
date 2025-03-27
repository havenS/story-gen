import { Prisma } from '@prisma/client';

export type StoryWithRelations = Prisma.storiesGetPayload<{
  include: {
    chapters: true;
    types: {
      select: {
        id: true;
        name: true;
        story_prompt: true;
        chapter_prompt: true;
        image_prompt: true;
        sound_prompt: true;
        chapter_count: true;
        word_count: true;
        youtube_channel_id: true;
        youtube_playlist_id: true;
      };
    };
  };
}>;
