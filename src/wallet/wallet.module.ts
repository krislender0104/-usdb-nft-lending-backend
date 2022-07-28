import { Module } from '@nestjs/common';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

import { LoanModule } from '../loan/loan.module';

@Module({
  imports: [LoanModule],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}
