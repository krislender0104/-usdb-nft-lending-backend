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

import { TermService } from './term.service';
import { Term } from './entities/term.entity';
import { TermDto } from './dto/term.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { PaginationDto } from '../core/dto/pagination.dto';
import { SuccessResponse } from '../core/models/response';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('Term Management')
@Controller('api/term')
export class TermController {
  constructor(private readonly termService: TermService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async terms(@Query() query: PaginationDto): Promise<PaginatorDto<TermDto>> {
    const [data, count] = await this.termService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
    );
    return {
      data: data.map((item: Term) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOkResponse({ type: () => Term })
  async create(@Body() payload: TermDto): Promise<Term> {
    return await this.termService.create(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Term })
  async term(@Param('id') id: string): Promise<Term> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested term.');
    }
    return this.termService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => Term })
  async update(
    @Param('id') id: string,
    @Body() payload: TermDto,
    @Request() req,
  ): Promise<TermDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested term.');
    }
    const updated = await this.termService.update(id, payload, req);
    return updated.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested term.');
    }
    return this.termService.remove(id);
  }
}
