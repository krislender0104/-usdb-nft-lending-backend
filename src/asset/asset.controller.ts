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

import { AssetService } from './asset.service';
import { Asset } from './entities/asset.entity';
import { AssetDto } from './dto/asset.dto';
import { AssetPaginationDto } from './dto/asset-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { SuccessResponse } from '../core/models/response';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('Asset Management')
@Controller('api/asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async assets(
    @Query() query: AssetPaginationDto,
  ): Promise<PaginatorDto<AssetDto>> {
    const [data, count] = await this.assetService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.status,
      query.openseaIds,
      query.contractAddress,
      query.tokenId,
      query.assetType,
      query.mediaType,
      query.sortQuery
    );
    return {
      data: data.map((item: Asset) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOkResponse({ type: () => Asset })
  async create(@Body() payload: AssetDto, @Request() req): Promise<Asset> {
    return await this.assetService.create(payload, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Asset })
  async asset(@Param('id') id: string): Promise<Asset> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested asset.');
    }
    return this.assetService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Asset })
  async update(
    @Param('id') id: string,
    @Body() payload: AssetDto,
    @Request() req,
  ): Promise<AssetDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested asset.');
    }
    const updated = await this.assetService.update(id, payload, req);
    return updated.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested asset.');
    }
    return this.assetService.remove(id);
  }
}
