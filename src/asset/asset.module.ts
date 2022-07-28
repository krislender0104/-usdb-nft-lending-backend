import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asset } from './entities/asset.entity';
import { User } from '../user/entities/user.entity';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, User]), UserModule],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
