import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'USDB NFT Lending/Borrowing Marketplace API';
  }
}
