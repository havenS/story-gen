import { ApiProperty } from '@nestjs/swagger';
import { ChapterDto } from 'src/chapters/dto/chapter.dto';
import { PublishingDto } from 'src/publishing/dto/publishing.dto';
import { TypeDto } from 'src/types/dto/type.dto';

export class StoryDto {
  @ApiProperty({
    description: 'ID of the story',
    example: 1,
  })
  id?: number;

  @ApiProperty({
    description: 'Title of the story',
    example: 'The Haunting of Hill House',
  })
  name: string;

  @ApiProperty({
    description: 'Synopsis of the story',
    example:
      'A family moves into a haunted house and discovers its dark secrets.',
  })
  synopsis: string;

  @ApiProperty()
  audio_url: string;

  @ApiProperty()
  image_prompt: string;

  @ApiProperty()
  background_image: string;

  @ApiProperty()
  thumbnail_url: string;

  @ApiProperty()
  video_url: string;

  @ApiProperty({
    description: 'Array of chapters in the story',
    type: [ChapterDto],
  })
  chapters: ChapterDto[];

  @ApiProperty()
  publishings?: PublishingDto[];

  @ApiProperty({
    description: 'ID of the story type',
    example: 1,
  })
  types_id: number;

  @ApiProperty()
  types: TypeDto;

  @ApiProperty()
  created_at?: Date;

  @ApiProperty()
  updated_at?: Date;
}
