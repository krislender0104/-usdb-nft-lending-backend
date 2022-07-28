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

import { LoanService } from './loan.service';
import { Loan } from './entities/loan.entity';
import { LoanDto } from './dto/loan.dto';
import { LoanPaginationDto } from './dto/loan-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { SuccessResponse } from '../core/models/response';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';
import { isUUID } from 'class-validator';

@ApiTags('Loan Management')
@Controller('api/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async loans(
    @Query() query: LoanPaginationDto,
    @Request() req,
  ): Promise<PaginatorDto<LoanDto>> {
    const [data, count] = await this.loanService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.assetId,
      query.assetListingId,
      query.lenderAddress,
      query.borrowerAddress,
      query.walletAddress,
      query.status,
      query.contractLoanId ? query.contractLoanId.toString() : '',
      query.sortQuery
    );
    return {
      data: data.map((item: Loan) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOkResponse({ type: () => Loan })
  async create(@Body() payload: LoanDto, @Request() req): Promise<Loan> {
    return await this.loanService.create(payload, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Loan })
  async loan(@Param('id') id: string): Promise<Loan> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested loan.');
    }
    return this.loanService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Loan })
  async update(
    @Param('id') id: string,
    @Body() payload: LoanDto
  ): Promise<LoanDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested loan.');
    }
    const updated = await this.loanService.update(id, payload);
    return updated.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('reset-status/:id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Boolean })
  async resetStatus(
    @Param('id') id: string,
    @Request() req
  ): Promise<Boolean> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested loan.');
    }
    const loan = await this.loanService.findById(id);
    if (!loan) {
      throw new BadRequestException('Could not find requested loan.');
    }
    if (loan.contractLoanId) {
      throw new BadRequestException('Could not update requested loan because this loan is already added to Vault.');
    }
    return await this.loanService.resetStatus(loan, req);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested loan.');
    }
    return this.loanService.remove(id);
  }

}
