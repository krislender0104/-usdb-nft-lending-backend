import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString, IsUUID
} from 'class-validator';

export class CollectionDto {
  @ApiProperty({ required: false })
  @IsUUID()
  readonly id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsArray()
  contractAddress: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  openListingCount?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  closeListingCount?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  openLoanCount?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  closeLoanCount?: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
