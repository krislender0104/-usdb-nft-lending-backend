import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetListing } from '../asset-listing/entities/asset-listing.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Loan } from '../loan/entities/loan.entity';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';

import { AssetModule } from '../asset/asset.module';
import { UserNotificationModule } from '../user-notification/user-notification.module';
import { TransferHistoryModule } from '../transfer-history/transfer-history.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetListing, Offer, Asset, Loan]),
    AssetModule,
    UserModule,
    UserNotificationModule,
    TransferHistoryModule
  ],
  controllers: [NftController],
  providers: [NftService],
  exports: [NftService]
})
export class NftModule {}
