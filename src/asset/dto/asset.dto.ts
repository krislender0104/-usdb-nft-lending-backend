import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  IsBoolean,
  IsEnum,
  IsEthereumAddress,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  AssetStatus, AssetType,
  Chain,
  CollectibleMediaType
} from '../../core/enums/asset';
import { UpdateUserDto } from '../../user/dto/update-user.dto';

export class AssetDto {
  @ApiProperty({ required: false })
  readonly id?: string;

  @ApiProperty({ type: () => UpdateUserDto })
  owner: UpdateUserDto;

  @ApiProperty({ enum: AssetStatus })
  @IsEnum(AssetStatus)
  status: AssetStatus;

  @ApiProperty({ enum: AssetType })
  @IsEnum(AssetType)
  type: AssetType;

  @ApiProperty()
  @IsString()
  openseaId: string;

  @ApiProperty()
  @IsString()
  tokenId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CollectibleMediaType })
  @IsEnum(CollectibleMediaType)
  mediaType: CollectibleMediaType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  frameUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  threeDUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gifUrl?: string;

  @ApiProperty()
  @IsBoolean()
  isOwned: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  dateCreated?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  dateLastTransferred?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  externalLink?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  permaLink?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  assetContractAddress?: string;

  @ApiProperty({ enum: Chain })
  @IsEnum(Chain)
  chain: Chain;

  @ApiProperty()
  @IsEthereumAddress()
  wallet: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
