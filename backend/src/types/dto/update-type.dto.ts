import { PartialType } from '@nestjs/swagger';
import { TypeDto } from './type.dto';

export class UpdateTypeDto extends PartialType(TypeDto) {}
