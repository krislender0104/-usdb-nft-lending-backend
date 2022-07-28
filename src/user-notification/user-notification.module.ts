import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserNotification } from './entities/user-notification.entity';
import { User } from '../user/entities/user.entity';
import { UserNotificationService } from './user-notification.service';
import { UserNotificationController } from './user-notification.controller';

import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification, User]), UserModule],
  controllers: [UserNotificationController],
  providers: [UserNotificationService],
  exports: [UserNotificationService]
})
export class UserNotificationModule {}
