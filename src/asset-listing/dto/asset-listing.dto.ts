import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEnum } from 'class-validator';

import { AssetDto } from '../../asset/dto/asset.dto';
import { TermDto } from '../../term/dto/term.dto';
import { AssetListingStatus } from '../../core/enums/asset-listing';

export class AssetListingDto {
  @ApiProperty({ required: false })
  readonly id?: string;

  @ApiProperty({ type: () => AssetDto })
  asset: AssetDto;

  @ApiProperty({ type: () => TermDto })
  term: TermDto;

  @ApiProperty({ enum: AssetListingStatus })
  @IsEnum(AssetListingStatus)
  status: AssetListingStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
