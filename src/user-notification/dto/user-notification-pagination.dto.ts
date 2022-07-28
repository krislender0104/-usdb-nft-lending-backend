import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';
import { NotificationContext, NotificationStatus, UserType } from '../../core/enums/notification';

export class UserNotificationPaginationDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationStatus)
  readonly status?: NotificationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(NotificationContext)
  readonly context?: NotificationContext;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly contextId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(UserType)
  readonly userType?: UserType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly userAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sortQuery?: string;
}
