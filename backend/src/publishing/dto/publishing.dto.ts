import { ApiProperty } from "@nestjs/swagger";

export class PublishingDto {
  @ApiProperty({
    required: true,
  })
  id: number;

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

  @ApiProperty()
  patreon_published: boolean;
}
