import { Injectable } from '@nestjs/common';

import { WalletDetailDto } from './dto/wallet-detail.dto';
import { LoanService } from '../loan/loan.service';
import { Loan } from '../loan/entities/loan.entity';
import { Currency } from '../core/models/currency';
import { getTokenPrice } from '../core/utils/token';
import { NetworkIds } from '../core/enums/network';
import { LoanStatus } from '../core/enums/loan';
import { availableCurrencies } from '../core/constants/currency';

@Injectable()
export class WalletService {
  isDev = false;

  constructor(private loanService: LoanService) {
    this.isDev = process.env.IS_DEV === 'true';
  }

  async getDetail(address: string): Promise<WalletDetailDto> {
    const lenderLoans = await this.loanService.getLenderLoans(address);
    const borrowerLoans = await this.loanService.getBorrowerLoans(address);
    const currencyIds = availableCurrencies.reduce((accumulator, currency: Currency, index: number) => (accumulator + currency.coingeckoStub + ((index < availableCurrencies.length - 1) ? ',' : '')), '');
    const tokenPrices = await getTokenPrice(currencyIds);
    const currencies = availableCurrencies.map((currency: Currency) => {
      return {
        ...currency,
        usdPrice: tokenPrices[currency.coingeckoStub]?.usd || 1
      };
    });
    let totalBorrowed = 0;
    let totalLent = 0;
    borrowerLoans.forEach((loan: Loan) => {
      const currency = currencies.find((currency: Currency) => currency.addresses[this.isDev ? NetworkIds.Rinkeby : NetworkIds.Ethereum] === loan.term.currencyAddress);
      totalBorrowed += loan.term.amount * (currency?.usdPrice || 1);
    });
    lenderLoans.forEach((loan: Loan) => {
      const currency = currencies.find((currency: Currency) => currency.addresses[this.isDev ? NetworkIds.Rinkeby : NetworkIds.Ethereum] === loan.term.currencyAddress);
      totalLent += loan.term.amount * (currency?.usdPrice || 1);
    });
    const loansRepaid = borrowerLoans.filter((loan: Loan) => loan.status === LoanStatus.Complete).length;
    const loansDefaulted = borrowerLoans.filter((loan: Loan) => loan.status === LoanStatus.Default).length;
    return {
      totalBorrowed,
      totalLent,
      loansRepaid,
      loansDefaulted,
      loansBorrowed: borrowerLoans.length,
      loansGiven: lenderLoans.length
    };
  }
}
