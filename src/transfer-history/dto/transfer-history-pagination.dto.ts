import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';
import { AssetType } from '../../core/enums/asset';

export class TransferHistoryPaginationDto extends PaginationDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly assetContractAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly tokenId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AssetType)
  readonly assetType?: AssetType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly from?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly to?: string;

}
