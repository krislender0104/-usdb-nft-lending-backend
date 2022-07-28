import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class WalletDetailDto {
  @ApiProperty()
  @IsNumber()
  totalBorrowed: number;

  @ApiProperty()
  @IsNumber()
  totalLent: number;

  @ApiProperty()
  @IsNumber()
  loansRepaid: number;

  @ApiProperty()
  @IsNumber()
  loansDefaulted: number;

  @ApiProperty()
  @IsNumber()
  loansBorrowed: number;

  @ApiProperty()
  @IsNumber()
  loansGiven: number;
}
