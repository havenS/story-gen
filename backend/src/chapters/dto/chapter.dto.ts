import { ApiProperty } from "@nestjs/swagger";
import { StoryDto } from "src/stories/dto/story.dto";

export class ChapterDto {
  @ApiProperty({
    required: true,
  })
  id: number;

  @ApiProperty({
    required: true,
  })
  number: number;

  @ApiProperty({
    required: true,
  })
  title: string;

  @ApiProperty({
    required: true,
  })
  summary: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  background_sound: string;

  @ApiProperty()
  audio_url: string;

  @ApiProperty()
  video_url: string;

  @ApiProperty({
    required: true,
  })
  stories_id: StoryDto['id'];
}
