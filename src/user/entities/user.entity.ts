import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UpdateUserDto } from '../dto/update-user.dto';
import { UserNotification } from '../../user-notification/entities/user-notification.entity';
import { Asset } from '../../asset/entities/asset.entity';
import { Loan } from '../../loan/entities/loan.entity';
import { Offer } from '../../offer/entities/offer.entity';

@Entity('user')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  address: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  email: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  name: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  description: string;

  @ApiProperty()
  @Column({ nullable: true, default: null })
  profileImageUrl: string;

  @OneToMany(
    () => UserNotification,
    (userNotification) => userNotification.user,
  )
  notifications: UserNotification[];

  @OneToMany(() => Asset, (asset) => asset.owner)
  assets: Asset[];

  @OneToMany(() => Loan, (loan) => loan.borrower)
  borrowerLoans: Loan[];

  @OneToMany(() => Offer, (offer) => offer.lender)
  offers: Offer[];

  @OneToMany(() => Loan, (loan) => loan.lender)
  lenderLoans: Loan[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  toDto(): UpdateUserDto {
    return {
      id: this.id,
      address: this.address,
      name: this.name,
      email: this.email,
      description: this.description,
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
