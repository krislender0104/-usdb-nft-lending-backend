import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

import { TransferHistoryService } from './transfer-history.service';
import { TransferHistoryDto } from './dto/transfer-history.dto';
import { TransferHistory } from './entities/transfer-history.entity';
import { TransferHistoryPaginationDto } from './dto/transfer-history-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('Transfer History Management')
@Controller('api/transfer-history')
export class TransferHistoryController {
  constructor(private readonly transferHistoryService: TransferHistoryService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async transferHistories(@Query() query: TransferHistoryPaginationDto): Promise<PaginatorDto<TransferHistoryDto>> {
    const [data, count] = await this.transferHistoryService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.assetContractAddress,
      query.tokenId,
      query.assetType,
      query.from,
      query.to
    );
    return {
      data: data.map((item: TransferHistory) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => TransferHistory })
  async transferHistory(@Param('id') id: string): Promise<TransferHistory> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested transferHistory.');
    }
    return this.transferHistoryService.findById(id);
  }

}
