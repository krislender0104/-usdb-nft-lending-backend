import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { UserNotificationDto } from '../dto/user-notification.dto';
import { Importance } from '../../core/enums/base';
import { NotificationStatus, NotificationContext, UserType } from '../../core/enums/notification';

@Entity('user_notification')
export class UserNotification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @ApiProperty({ enum: Importance })
  @Column({ type: 'enum', enum: Importance, default: Importance.Medium })
  importance: Importance;

  @ApiProperty()
  @Column()
  contextId: string;

  @ApiProperty({ enum: NotificationStatus })
  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.Unread })
  status: NotificationStatus;

  @ApiProperty({ enum: NotificationContext })
  @Column({ type: 'enum', enum: NotificationContext })
  context: NotificationContext;

  @ApiProperty({ enum: UserType })
  @Column({ type: 'enum', enum: UserType })
  userType: UserType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): UserNotificationDto {
    return {
      id: this.id,
      user: this.user,
      importance: this.importance,
      contextId: this.contextId,
      userType: this.userType,
      status: this.status,
      context: this.context,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
