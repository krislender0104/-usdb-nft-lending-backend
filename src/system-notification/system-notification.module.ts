import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemNotification } from './entities/system-notification.entity';
import { SystemNotificationService } from './system-notification.service';
import { SystemNotificationController } from './system-notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemNotification])],
  controllers: [SystemNotificationController],
  providers: [SystemNotificationService],
})
export class SystemNotificationModule {}
