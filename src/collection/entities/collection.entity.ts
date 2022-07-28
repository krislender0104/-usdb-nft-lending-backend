import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '../../core/utils/typeorm';
import { CollectionDto } from '../dto/collection.dto';

@Entity('collection')
export class Collection {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  slug: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  imageUrl: string;

  @ApiProperty()
  @Column()
  contractAddress: string;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: 0,
  })
  openListingCount: number;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: 0,
  })
  closeListingCount: number;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: 0,
  })
  openLoanCount: number;

  @ApiProperty()
  @Column('numeric', {
    precision: 20,
    scale: 15,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: 0,
  })
  closeLoanCount: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): CollectionDto {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      imageUrl: this.imageUrl,
      contractAddress: this.contractAddress,
      openListingCount: this.openListingCount,
      closeListingCount: this.closeListingCount,
      openLoanCount: this.openLoanCount,
      closeLoanCount: this.closeLoanCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
