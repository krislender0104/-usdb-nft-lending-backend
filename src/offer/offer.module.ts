import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offer } from './entities/offer.entity';
import { Term } from '../term/entities/term.entity';
import { AssetListing } from '../asset-listing/entities/asset-listing.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';

import { TermModule } from '../term/term.module';
import { AssetListingModule } from '../asset-listing/asset-listing.module';
import { UserModule } from '../user/user.module';
import { AssetModule } from '../asset/asset.module';
import { UserNotificationModule } from '../user-notification/user-notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Term, Asset, AssetListing, User]),
    TermModule,
    AssetListingModule,
    UserModule,
    AssetModule,
    UserNotificationModule
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService]
})
export class OfferModule {
}
