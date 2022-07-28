import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

import { AssetListingService } from './asset-listing.service';
import { AssetListing } from './entities/asset-listing.entity';
import { AssetListingDto } from './dto/asset-listing.dto';
import { AssetListingPaginationDto } from './dto/asset-listing-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { SuccessResponse } from '../core/models/response';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('Asset Listing Management')
@Controller('api/asset-listing')
export class AssetListingController {
  constructor(private readonly assetListingService: AssetListingService) {}

  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async assetListings(
    @Query() query: AssetListingPaginationDto,
  ): Promise<PaginatorDto<AssetListingDto>> {
    const [data, count] = await this.assetListingService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.status,
      query.openseaIds,
      query.contractAddress,
      query.tokenId,
      query.borrower,
      query.keyword,
      query.currencyAddress,
      query.mediaType,
      query.minApr ? query.minApr.toString() : '',
      query.maxApr ? query.maxApr.toString() : '',
      query.minDuration ? query.minDuration.toString() : '',
      query.maxDuration ? query.maxDuration.toString() : '',
      query.minPrice ? query.minPrice.toString() : '',
      query.maxPrice ? query.maxPrice.toString() : '',
      query.sortQuery
    );
    return {
      data: data.map((item: AssetListing) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOkResponse({ type: () => AssetListing })
  async create(
    @Body() payload: AssetListingDto,
    @Request() req,
  ): Promise<AssetListing> {
    return await this.assetListingService.create(payload, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => AssetListing })
  async assetListing(@Param('id') id: string): Promise<AssetListing> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested listing asset.');
    }
    return this.assetListingService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested listing asset.');
    }
    return this.assetListingService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => AssetListing })
  async update(
    @Param('id') id: string,
    @Body() payload: AssetListingDto,
    @Request() req,
  ): Promise<AssetListingDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested listing asset.');
    }
    const updated = await this.assetListingService.update(
      id,
      payload,
      req
    );
    return updated.toDto();
  }
}
