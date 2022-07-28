import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { Importance } from '../../core/enums/base';
import { NotificationContext, NotificationStatus, UserType } from '../../core/enums/notification';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

export class UserNotificationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  readonly id?: string;

  @ApiProperty({ type: () => UpdateUserDto })
  user: UpdateUserDto;

  @ApiProperty({ enum: Importance })
  @IsEnum(Importance)
  @IsOptional()
  importance?: Importance;

  @ApiProperty()
  @IsString()
  contextId: string;

  @ApiProperty({ enum: NotificationStatus })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  @IsOptional()
  userType: UserType;

  @ApiProperty({ enum: NotificationContext })
  @IsEnum(NotificationContext)
  context: NotificationContext;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
