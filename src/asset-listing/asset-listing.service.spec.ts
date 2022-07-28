import { Test, TestingModule } from '@nestjs/testing';
import { AssetListingService } from './asset-listing.service';

describe('AssetListingService', () => {
  let service: AssetListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetListingService],
    }).compile();

    service = module.get<AssetListingService>(AssetListingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
