import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { AssetListing } from '../../asset-listing/entities/asset-listing.entity';
import { OfferDto } from '../dto/offer.dto';
import { Term } from '../../term/entities/term.entity';
import { OfferStatus } from '../../core/enums/offer';

@Entity('offer')
export class Offer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.offers)
  lender: User;

  @ManyToOne(() => AssetListing, (assetListing) => assetListing.offers)
  assetListing: AssetListing;

  @OneToOne(() => Term, (term) => term.offer)
  @JoinColumn()
  term: Term;

  @ApiProperty({ enum: OfferStatus })
  @Column({ type: 'enum', enum: OfferStatus })
  status: OfferStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): OfferDto {
    return {
      id: this.id,
      lender: this.lender,
      assetListing: this.assetListing,
      term: this.term,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
