import { ApiProperty } from '@nestjs/swagger';

export class ChapterDto {
  @ApiProperty({
    description: 'ID of the chapter',
    example: 1,
  })
  id?: number;

  @ApiProperty({
    description: 'Number of the chapter',
    example: 1,
  })
  number?: number;

  @ApiProperty({
    description: 'Title of the chapter',
    example: 'Chapter 1: The Beginning',
  })
  title: string;

  @ApiProperty({
    description: 'Summary of the chapter',
    example:
      'This chapter introduces the main characters and sets the stage for the story.',
  })
  summary: string;

  @ApiProperty({
    description: 'Content of the chapter',
    example:
      'Once upon a time, in a small town called Hill House, there lived a family...',
  })
  content?: string;

  @ApiProperty({
    description: 'Background sound for the chapter',
    example: 'wind.mp3',
  })
  background_sound?: string;

  @ApiProperty({
    description: 'ID of the story this chapter belongs to',
    example: 1,
  })
  story_id?: number;

  @ApiProperty()
  created_at?: Date;

  @ApiProperty()
  updated_at?: Date;
}
