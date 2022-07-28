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

import { OfferService } from './offer.service';
import { Offer } from './entities/offer.entity';
import { OfferDto } from './dto/offer.dto';
import { OfferPaginationDto } from './dto/offer-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { SuccessResponse } from '../core/models/response';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('Offer Management')
@Controller('api/offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async offers(
    @Query() query: OfferPaginationDto,
    @Request() req,
  ): Promise<PaginatorDto<OfferDto>> {
    const [data, count] = await this.offerService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.assetId,
      query.assetListingId,
      query.lenderAddress,
      query.borrowerAddress,
      query.status,
      query.sortQuery
    );
    return {
      data: data.map((item: Offer) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOkResponse({ type: () => Offer })
  async create(@Body() payload: OfferDto, @Request() req): Promise<Offer> {
    return await this.offerService.create(payload, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Offer })
  async offer(@Param('id') id: string): Promise<Offer> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested offer.');
    }
    return this.offerService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Offer })
  async update(
    @Param('id') id: string,
    @Body() payload: OfferDto,
    @Request() req
  ): Promise<OfferDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested offer.');
    }
    const updated = await this.offerService.update(id, payload, req);
    return updated.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested offer.');
    }
    return this.offerService.remove(id);
  }
}
