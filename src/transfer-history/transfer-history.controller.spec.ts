import { Test, TestingModule } from '@nestjs/testing';
import { TransferHistoryController } from './transfer-history.controller';
import { TransferHistoryService } from './transfer-history.service';

describe('TransferHistoryController', () => {
  let controller: TransferHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferHistoryController],
      providers: [TransferHistoryService],
    }).compile();

    controller = module.get<TransferHistoryController>(TransferHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
