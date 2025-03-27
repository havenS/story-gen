import { ApiProperty } from '@nestjs/swagger';

export class TypeDto {
  @ApiProperty({
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'Type of the story',
    example: 'Horror',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Story prompt',
    example: 'Prompt to create a story',
    required: true,
  })
  story_prompt: string;

  @ApiProperty({
    description: 'Chapter prompt',
    example: 'Prompt to create a chapter',
    required: true,
  })
  chapter_prompt: string;

  @ApiProperty({
    description: 'Image prompt',
    example: 'Prompt to create a background image',
    required: true,
  })
  image_prompt: string;

  @ApiProperty({
    description: 'Sound prompt',
    example: 'Prompt to find a matching background sound',
    required: true,
  })
  sound_prompt: string;

  @ApiProperty({
    description: 'Youtube channel ID',
    example: 'UC_9-kyTW8ZkZNDHQJ6FgpwQ',
    required: true,
  })
  youtube_channel_id: string;

  @ApiProperty({
    description: 'Youtube playlist ID',
    example: 'PL1234567890',
    required: true,
  })
  youtube_playlist_id: string;

  @ApiProperty({
    description: 'Number of chapters to generate',
    example: 3,
    required: true,
  })
  chapter_count: number;

  @ApiProperty({
    description: 'Minimum word count for the story',
    example: 1000,
    required: true,
  })
  word_count: number;
}
