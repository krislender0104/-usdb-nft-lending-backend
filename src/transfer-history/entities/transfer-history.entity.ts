import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TransferHistoryDto } from '../dto/transfer-history.dto';
import { ColumnNumericTransformer } from '../../core/utils/typeorm';
import { AssetType } from '../../core/enums/asset';

@Entity('transfer_history')
export class TransferHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  assetContractAddress: string;

  @ApiProperty()
  @Column('numeric', {
    precision: 38,
    scale: 18,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
    default: null,
  })
  tokenId: number;

  @ApiProperty({ enum: AssetType })
  @Column({ type: 'enum', enum: AssetType })
  assetType: AssetType;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  from: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  to: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): TransferHistoryDto {
    return {
      id: this.id,
      assetContractAddress: this.assetContractAddress,
      tokenId: this.tokenId,
      assetType: this.assetType,
      from: this.from,
      to: this.to,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
