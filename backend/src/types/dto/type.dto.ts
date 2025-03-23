import { ApiProperty } from "@nestjs/swagger";

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
    required: true,
  })
  story_prompt: string;

  @ApiProperty({
    required: true,
  })
  chapter_prompt: string;

  @ApiProperty({
    required: true,
  })
  image_prompt: string;

  @ApiProperty({
    required: true,
  })
  sound_prompt: string;

  @ApiProperty({
    required: true,
  })
  youtube_channel_id: string;

  @ApiProperty({
    required: true,
  })
  youtube_playlist_id: string;
}
