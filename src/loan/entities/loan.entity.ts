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
import { LoanDto } from '../dto/loan.dto';
import { Term } from '../../term/entities/term.entity';
import { LoanStatus } from '../../core/enums/loan';
import { ColumnNumericTransformer } from '../../core/utils/typeorm';

@Entity('loan')
export class Loan {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.lenderLoans)
  lender: User;

  @ManyToOne(() => User, (user) => user.borrowerLoans)
  borrower: User;

  @OneToOne(() => AssetListing, (assetListing) => assetListing.loan)
  @JoinColumn()
  assetListing: AssetListing;

  @OneToOne(() => Term, (term) => term.loan)
  @JoinColumn()
  term: Term;

  @ApiProperty({ enum: LoanStatus })
  @Column({ type: 'enum', enum: LoanStatus })
  status: LoanStatus;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: null,
  })
  contractLoanId: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): LoanDto {
    return {
      id: this.id,
      borrower: this.borrower,
      lender: this.lender,
      assetListing: this.assetListing,
      term: this.term,
      contractLoanId: this.contractLoanId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
