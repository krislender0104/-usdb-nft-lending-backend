import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';
import { AssetStatus, CollectibleMediaType } from '../../core/enums/asset';

export class AssetPaginationDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AssetStatus)
  readonly status?: AssetStatus;

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
  readonly assetType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(CollectibleMediaType)
  readonly mediaType?: CollectibleMediaType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sortQuery?: string;
}
