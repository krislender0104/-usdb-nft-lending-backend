import { Erc20CurrencyAddress } from '../types/currency';

export interface Currency {
  symbol: string;
  name: string;
  icon?: string; //svg
  addresses: Erc20CurrencyAddress;
  coingeckoStub: string;
  usdPrice?: number;
}
