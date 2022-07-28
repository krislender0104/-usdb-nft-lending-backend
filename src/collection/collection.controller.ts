import {
  Controller,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CollectionService } from './collection.service';
import { Collection } from './entities/collection.entity';
import { CollectionDto } from './dto/collection.dto';
import { CollectionPaginationDto } from './dto/collection-pagination.dto';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('Collection Management')
@Controller('api/collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async offers(
    @Query() query: CollectionPaginationDto,
    @Request() req,
  ): Promise<PaginatorDto<CollectionDto>> {
    const [data, count] = await this.collectionService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.contractAddress,
      query.slug,
      query.sortQuery
    );
    return {
      data: data.map((item: Collection) => {
        return item.toDto();
      }),
      count,
    };
  }

}
