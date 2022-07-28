import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';

import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { AssetListingDto } from '../../asset-listing/dto/asset-listing.dto';
import { TermDto } from '../../term/dto/term.dto';
import { LoanStatus } from '../../core/enums/loan';

export class LoanDto {
  @ApiProperty({ required: false })
  @IsUUID()
  readonly id?: string;

  @ApiProperty({ type: () => UpdateUserDto })
  lender: UpdateUserDto;

  @ApiProperty({ type: () => UpdateUserDto })
  borrower: UpdateUserDto;

  @ApiProperty({ type: () => AssetListingDto })
  assetListing: AssetListingDto;

  @ApiProperty({ type: () => TermDto })
  term: TermDto;

  @ApiProperty({ enum: LoanStatus })
  @IsEnum(LoanStatus)
  status: LoanStatus;

  @ApiProperty()
  @IsNumber()
  contractLoanId: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
