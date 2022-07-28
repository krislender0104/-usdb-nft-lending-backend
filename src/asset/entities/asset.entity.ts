import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { AssetListing } from '../../asset-listing/entities/asset-listing.entity';
import { AssetDto } from '../dto/asset.dto';
import {
  AssetStatus, AssetType,
  Chain,
  CollectibleMediaType
} from '../../core/enums/asset';

@Entity('asset')
export class Asset {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.assets)
  owner: User;

  @OneToMany(() => AssetListing, (assetListing) => assetListing.asset)
  assetListings: AssetListing[];

  @ApiProperty({ enum: AssetStatus })
  @Column({ type: 'enum', enum: AssetStatus })
  status: AssetStatus;

  @ApiProperty({ enum: AssetType })
  @Column({ type: 'enum', enum: AssetType, default: AssetType.ERC721 })
  type: AssetType;

  @ApiProperty()
  @Column()
  openseaId: string;

  @ApiProperty()
  @Column()
  tokenId: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  name: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  description: string;

  @ApiProperty({ enum: CollectibleMediaType })
  @Column({ type: 'enum', enum: CollectibleMediaType })
  mediaType: CollectibleMediaType;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  frameUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  imageUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  videoUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  threeDUrl: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  gifUrl: string;

  @ApiProperty()
  @Column({ default: false })
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

  @ApiProperty({ enum: Chain })
  @Column({ type: 'enum', enum: Chain })
  chain: Chain;

  @ApiProperty()
  @Column()
  wallet: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): AssetDto {
    return {
      id: this.id,
      owner: this.owner,
      status: this.status,
      type: this.type,
      openseaId: this.openseaId,
      tokenId: this.tokenId,
      name: this.name,
      description: this.description,
      mediaType: this.mediaType,
      frameUrl: this.frameUrl,
      imageUrl: this.imageUrl,
      videoUrl: this.videoUrl,
      threeDUrl: this.threeDUrl,
      gifUrl: this.gifUrl,
      isOwned: this.isOwned,
      dateCreated: this.dateCreated,
      dateLastTransferred: this.dateLastTransferred,
      externalLink: this.externalLink,
      permaLink: this.permaLink,
      assetContractAddress: this.assetContractAddress,
      chain: this.chain,
      wallet: this.wallet,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
