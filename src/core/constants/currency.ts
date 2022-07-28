import { Currency } from '../models/currency';
import { NetworkIds } from '../enums/network';

export const availableCurrencies: Currency[] = [
  {
    symbol: 'USDB',
    name: 'USDBalance',
    addresses: {
      [NetworkIds.Ethereum]: '0x02B5453D92B730F29a86A0D5ef6e930c4Cf8860B',
      [NetworkIds.Rinkeby]: '0x334bf069C185b0E5e4DF3B4a15A67ecb905941fa'
    },
    coingeckoStub: 'usd-balance',
    usdPrice: 1,
  },
  {
    symbol: 'DAI',
    name: 'DAI',
    addresses: {
      [NetworkIds.Ethereum]: '0x6b175474e89094c44da98b954eedeac495271d0f',
      [NetworkIds.Rinkeby]: '0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286'
    },
    coingeckoStub: 'dai',
    usdPrice: 1,
  },
  {
    symbol: 'wETH',
    name: 'Wrapped Ethereum',
    addresses: {
      [NetworkIds.Ethereum]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      [NetworkIds.Rinkeby]: '0xc778417E063141139Fce010982780140Aa0cD5Ab'
    },
    coingeckoStub: 'weth',
    usdPrice: 1,
  },
  {
    symbol: 'wBTC',
    name: 'Wrapped Bitcoin',
    addresses: {
      [NetworkIds.Ethereum]: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      [NetworkIds.Rinkeby]: '0x577D296678535e4903D59A4C929B718e1D575e0A'
    },
    coingeckoStub: 'wrapped-bitcoin',
    usdPrice: 1,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    addresses: {
      [NetworkIds.Ethereum]: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      [NetworkIds.Rinkeby]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b'
    },
    coingeckoStub: 'usd-coin',
    usdPrice: 1,
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    addresses: {
      [NetworkIds.Ethereum]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      [NetworkIds.Rinkeby]: '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02'
    },
    coingeckoStub: 'tether',
    usdPrice: 1,
  }
];
