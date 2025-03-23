import { ApiProperty } from "@nestjs/swagger";
import { TypeDto } from "src/types/dto/type.dto";

export class CreateStoryDto {
  @ApiProperty({
    description: 'Type id of the story',
    required: true,
  })
  types_id: TypeDto['id'];
}
