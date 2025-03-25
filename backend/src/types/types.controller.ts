import { Controller, Get, Param } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypeDto } from './dto/type.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Get()
  @ApiOkResponse({
    description: 'OK',
    type: TypeDto,
  })
  findAllTypes() {
    return this.typesService.findAll();
  }

  @Get(':id')
  findOneType(@Param('id') id: string) {
    return this.typesService.findOne(parseInt(id, 10));
  }

  @Get(':id/stories')
  findAllStoriesByType(@Param('id') id: string) {
    return this.typesService.getTypeStories(parseInt(id, 10));
  }
}
