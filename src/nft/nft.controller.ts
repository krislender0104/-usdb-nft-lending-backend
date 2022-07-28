import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { isUUID } from 'class-validator';

import { NftService } from './nft.service';
import { Erc20AddressDto } from '../core/dto/web3.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { Collectible } from '../core/models/opensea';

@ApiTags('Nft Management')
@Controller('api/nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: () => Collectible, isArray: true })
  @Get('fetch')
  getAll(@Query() query: Erc20AddressDto): Promise<Collectible[]> {
    return this.nftService.getAll(query.erc20Address);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('validate-nft/:assetId')
  @ApiImplicitParam({ name: 'assetId', required: true })
  @ApiOkResponse({ type: () => Boolean })
  async validateNft(@Param('assetId') assetId: string): Promise<boolean> {
    if (!isUUID(assetId)) {
      throw new BadRequestException('Could not find requested asset.');
    }
    return this.nftService.validateNft(assetId);
  }
}
