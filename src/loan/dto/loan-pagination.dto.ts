import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';

export class LoanPaginationDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly assetId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly assetListingId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly lenderAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly borrowerAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly walletAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly contractLoanId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sortQuery?: string;
}
