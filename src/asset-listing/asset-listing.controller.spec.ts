import { Test, TestingModule } from '@nestjs/testing';
import { AssetListingController } from './asset-listing.controller';
import { AssetListingService } from './asset-listing.service';

describe('AssetListingController', () => {
  let controller: AssetListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetListingController],
      providers: [AssetListingService],
    }).compile();

    controller = module.get<AssetListingController>(AssetListingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
