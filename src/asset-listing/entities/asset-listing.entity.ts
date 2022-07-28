import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Term } from '../../term/entities/term.entity';
import { Asset } from '../../asset/entities/asset.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { AssetListingDto } from '../dto/asset-listing.dto';
import { AssetListingStatus } from '../../core/enums/asset-listing';

@Entity('asset_listing')
export class AssetListing {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.assetListings)
  asset: Asset;

  @OneToOne(() => Loan, (loan) => loan.assetListing)
  loan: Loan;

  @OneToMany(() => Offer, (offer) => offer.assetListing)
  offers: Offer[];

  @OneToOne(() => Term, (term) => term.assetListing)
  @JoinColumn()
  term: Term;

  @ApiProperty({ enum: AssetListingStatus })
  @Column({ type: 'enum', enum: AssetListingStatus })
  status: AssetListingStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): AssetListingDto {
    return {
      id: this.id,
      asset: this.asset,
      term: this.term,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
