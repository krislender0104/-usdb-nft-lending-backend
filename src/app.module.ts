import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { NftModule } from './nft/nft.module';
import { AuthGuard } from './core/guards/auth.guard';
import { TermModule } from './term/term.module';
import { SystemNotificationModule } from './system-notification/system-notification.module';
import { LoanModule } from './loan/loan.module';
import { OfferModule } from './offer/offer.module';
import { UserNotificationModule } from './user-notification/user-notification.module';
import { AssetModule } from './asset/asset.module';
import { AssetListingModule } from './asset-listing/asset-listing.module';
import { WalletModule } from './wallet/wallet.module';
import { CollectionModule } from './collection/collection.module';
import { connectionSource } from './orm.config';
import { TransferHistoryModule } from './transfer-history/transfer-history.module';

@Module({
  imports: [
    // @ts-ignore
    TypeOrmModule.forRoot(connectionSource.options),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'files'),
    }),
    AuthModule,
    NftModule,
    UserModule,
    TermModule,
    SystemNotificationModule,
    LoanModule,
    OfferModule,
    UserNotificationModule,
    AssetModule,
    AssetListingModule,
    WalletModule,
    CollectionModule,
    TransferHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
