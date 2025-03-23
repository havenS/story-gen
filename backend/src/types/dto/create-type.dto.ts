import { PartialType } from "@nestjs/swagger";
import { TypeDto } from "./type.dto";

export class CreateTypeDto extends PartialType(TypeDto) { }
