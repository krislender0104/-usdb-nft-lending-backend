import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
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

import { SystemNotificationService } from './system-notification.service';
import { SystemNotification } from './entities/system-notification.entity';
import { SystemNotificationDto } from './dto/system-notification.dto';
import { SystemNotificationPaginationDto } from './dto/system-notification-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { SuccessResponse } from '../core/models/response';
import { getFromDto } from '../core/utils/repository';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('System Notification Management')
@Controller('api/system-notification')
export class SystemNotificationController {
  constructor(
    private readonly systemNotificationService: SystemNotificationService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async notifications(
    @Query() query: SystemNotificationPaginationDto,
  ): Promise<PaginatorDto<SystemNotificationDto>> {
    const [data, count] = await this.systemNotificationService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.sortQuery,
      query.skipExpiration,
    );
    return {
      data: data.map((item: SystemNotification) => {
        return item.toDto();
      }),
      count,
    };
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // @Post()
  // @ApiOkResponse({ type: () => SystemNotification })
  // async create(
  //   @Body() payload: SystemNotificationDto,
  // ): Promise<SystemNotification> {
  //   return await this.systemNotificationService.create(payload);
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SystemNotification })
  async notification(@Param('id') id: string): Promise<SystemNotification> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Could not find requested system notification.',
      );
    }
    return this.systemNotificationService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SystemNotification })
  async update(
    @Param('id') id: string,
    @Body() payload: SystemNotificationDto,
  ): Promise<SystemNotificationDto> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Could not find requested system notification.',
      );
    }
    let notification = await this.systemNotificationService.findById(id);
    if (!notification) {
      throw new BadRequestException(
        'The requested system notification does not exist. Please try again.',
      );
    }
    notification = getFromDto<SystemNotification>(payload, notification);
    const updated = await this.systemNotificationService.update(
      id,
      notification,
    );
    return updated.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Could not find requested system notification.',
      );
    }
    return this.systemNotificationService.remove(id);
  }
}
