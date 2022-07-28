import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsDate, IsEnum, IsString, IsUUID } from 'class-validator';

import { Importance } from '../../core/enums/base';

export class SystemNotificationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  readonly id?: string;

  @ApiProperty({ enum: Importance })
  @IsEnum(Importance)
  importance: Importance;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsDate()
  expirationAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
