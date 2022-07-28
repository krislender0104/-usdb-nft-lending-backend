import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { Loan } from './entities/loan.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Term } from '../term/entities/term.entity';
import { AssetListing } from '../asset-listing/entities/asset-listing.entity';
import { User } from '../user/entities/user.entity';
import { Collection } from '../collection/entities/collection.entity';
import { Offer } from '../offer/entities/offer.entity';

import { AssetListingModule } from '../asset-listing/asset-listing.module';
import { AssetModule } from '../asset/asset.module';
import { TermModule } from '../term/term.module';
import { UserModule } from '../user/user.module';
import { UserNotificationModule } from '../user-notification/user-notification.module';
import { CollectionModule } from '../collection/collection.module';
import { NftModule } from '../nft/nft.module';

import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Asset, Term, AssetListing, User, Collection, Offer]),
    ScheduleModule.forRoot(),
    AssetListingModule,
    AssetModule,
    TermModule,
    UserModule,
    UserNotificationModule,
    CollectionModule,
    NftModule
  ],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService]
})
export class LoanModule {
}
