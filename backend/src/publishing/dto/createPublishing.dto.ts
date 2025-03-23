import { ApiProperty } from "@nestjs/swagger";

export class CreatePublishingDto {
  @ApiProperty({
    required: true,
  })
  story_id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  youtube_id: string;
}
