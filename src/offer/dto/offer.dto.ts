import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEnum, IsUUID } from 'class-validator';

import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { AssetListingDto } from '../../asset-listing/dto/asset-listing.dto';
import { TermDto } from '../../term/dto/term.dto';
import { OfferStatus } from '../../core/enums/offer';

export class OfferDto {
  @ApiProperty({ required: false })
  @IsUUID()
  readonly id?: string;

  @ApiProperty({ type: () => UpdateUserDto })
  lender: UpdateUserDto;

  @ApiProperty({ type: () => AssetListingDto })
  assetListing: AssetListingDto;

  @ApiProperty({ type: () => TermDto })
  term: TermDto;

  @ApiProperty({ enum: OfferStatus })
  @IsEnum(OfferStatus)
  status: OfferStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
