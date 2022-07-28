import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SystemNotificationDto } from '../dto/system-notification.dto';
import { Importance } from '../../core/enums/base';

@Entity('system_notification')
export class SystemNotification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: Importance })
  @Column({ type: 'enum', enum: Importance })
  importance: Importance;

  @ApiProperty()
  @Column()
  message: string;

  @CreateDateColumn()
  expirationAt: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): SystemNotificationDto {
    return {
      id: this.id,
      importance: this.importance,
      message: this.message,
      expirationAt: this.expirationAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
