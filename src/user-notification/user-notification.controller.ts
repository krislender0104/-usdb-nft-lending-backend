import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { isUUID } from 'class-validator';

import { UserNotificationService } from './user-notification.service';
import { UserNotification } from './entities/user-notification.entity';
import { UserNotificationDto } from './dto/user-notification.dto';
import { UserNotificationPaginationDto } from './dto/user-notification-pagination.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { SuccessResponse } from '../core/models/response';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';

@ApiTags('User Notification Management')
@Controller('api/user-notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async notifications(
    @Query() query: UserNotificationPaginationDto,
  ): Promise<PaginatorDto<UserNotificationDto>> {
    const [data, count] = await this.userNotificationService.findAll(
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
      query.status,
      query.context,
      query.contextId,
      query.userType,
      query.userAddress,
      query.sortQuery
    );
    return {
      data: data.map((item: UserNotification) => {
        return item.toDto();
      }),
      count,
    };
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // @Post()
  // @ApiOkResponse({ type: () => UserNotification })
  // async create(@Body() body: UserNotificationDto): Promise<UserNotification> {
  //   return await this.userNotificationService.create(body);
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => UserNotification })
  async notification(@Param('id') id: string): Promise<UserNotification> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Could not find requested user notification.',
      );
    }
    return this.userNotificationService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => UserNotification })
  async update(
    @Param('id') id: string,
    @Body() payload: UserNotificationDto,
    @Request() req,
  ): Promise<UserNotificationDto> {
    if (!isUUID(id)) {
      throw new BadRequestException(
        'Could not find requested user notification.',
      );
    }
    const updated = await this.userNotificationService.update(id, payload, req);
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
        'Could not find requested user notification.',
      );
    }
    return this.userNotificationService.remove(id);
  }
}
