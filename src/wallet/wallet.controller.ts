import { Controller, Param, Get } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { WalletService } from './wallet.service';
import { WalletDetailDto } from './dto/wallet-detail.dto';

@ApiTags('Wallet Information')
@Controller('api/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiParam({ name: 'address', required: true })
  @ApiOkResponse({ type: WalletDetailDto })
  @Get(':address')
  async detail(@Param('address') address: string): Promise<WalletDetailDto> {
    return await this.walletService.getDetail(address);
  }
}
