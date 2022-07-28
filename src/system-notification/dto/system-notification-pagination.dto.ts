import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../core/dto/pagination.dto';

export class SystemNotificationPaginationDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly skipExpiration?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly sortQuery?: string;
}
