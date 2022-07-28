import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class TermDto {
  @ApiProperty({ required: false })
  @IsUUID()
  readonly id?: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  apr: number;

  @ApiProperty()
  @IsNumber()
  duration: number;

  @ApiProperty()
  @IsString()
  currencyAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiProperty()
  @IsDate()
  expirationAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt?: Date;
}
