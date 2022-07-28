import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';

export class CollectionPaginationDto extends PaginationDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly contractAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sortQuery?: string;
}
