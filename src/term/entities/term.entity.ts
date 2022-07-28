import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TermDto } from '../dto/term.dto';
import { AssetListing } from '../../asset-listing/entities/asset-listing.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { ColumnNumericTransformer } from '../../core/utils/typeorm';

@Entity('term')
export class Term {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => AssetListing, (assetListing) => assetListing.term)
  assetListing: AssetListing;

  @OneToOne(() => Offer, (offer) => offer.term)
  offer: Offer;

  @OneToOne(() => Loan, (loan) => loan.term)
  loan: Loan;

  @ApiProperty()
  @Column('numeric', {
    precision: 38,
    scale: 18,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: null,
  })
  amount: number;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: null,
  })
  apr: number;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: null,
  })
  duration: number;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  currencyAddress: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  signature: string;

  @CreateDateColumn()
  expirationAt: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): TermDto {
    return {
      id: this.id,
      amount: this.amount,
      apr: this.apr,
      duration: this.duration,
      signature: this.signature,
      currencyAddress: this.currencyAddress,
      expirationAt: this.expirationAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
