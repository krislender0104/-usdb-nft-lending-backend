import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransferHistory } from './entities/transfer-history.entity';
import { TransferHistoryController } from './transfer-history.controller';
import { TransferHistoryService } from './transfer-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferHistory])],
  controllers: [TransferHistoryController],
  providers: [TransferHistoryService],
  exports: [TransferHistoryService],
})
export class TransferHistoryModule {}
