import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AssetListing } from './entities/asset-listing.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Term } from '../term/entities/term.entity';
import { User } from '../user/entities/user.entity';
import { Collection } from '../collection/entities/collection.entity';

import { AssetModule } from '../asset/asset.module';
import { TermModule } from '../term/term.module';
import { UserModule } from '../user/user.module';
import { CollectionModule } from '../collection/collection.module';
import { NftModule } from '../nft/nft.module';

import { AssetListingService } from './asset-listing.service';
import { AssetListingController } from './asset-listing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetListing, Asset, Term, User, Collection]),
    ScheduleModule.forRoot(),
    AssetModule,
    TermModule,
    UserModule,
    CollectionModule,
    NftModule
  ],
  controllers: [AssetListingController],
  providers: [AssetListingService],
  exports: [AssetListingService],
})
export class AssetListingModule {}
