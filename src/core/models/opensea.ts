import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { IsBoolean, IsOptional } from 'class-validator';

type CollectibleMediaType = 'IMAGE' | 'VIDEO' | 'GIF' | 'THREE_D';
type Chain = 'eth' | 'sol';

export class Collectible {
  @ApiProperty()
  @Column()
  id: string;

  @ApiProperty()
  @Column()
  tokenId: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  name: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  description: string;

  @ApiProperty()
  @Column()
  mediaType: CollectibleMediaType;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  frameUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  imageUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  gifUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  videoUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  threeDUrl: string;

  @ApiProperty()
  @IsBoolean()
  isOwned: boolean;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  dateCreated: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  dateLastTransferred: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  externalLink: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  permaLink: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  assetContractAddress: string;

  @ApiProperty()
  @Column()
  chain: Chain;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  wallet: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  @IsOptional()
  collection?: any;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  @IsOptional()
  owner?: any;
}
