import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'List of all tags',
    type: [Tag],
  })
  findAll(): Promise<Tag[]> {
    return this.tagsService.findAll();
  }
}
