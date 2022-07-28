import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';
import { CollectibleMediaType } from '../../core/enums/asset';

export class AssetListingPaginationDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly openseaIds?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly contractAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly tokenId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly borrower?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly keyword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly currencyAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CollectibleMediaType)
  readonly mediaType?: CollectibleMediaType;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly minApr?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly maxApr?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly minDuration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly maxDuration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sortQuery?: string;

}
