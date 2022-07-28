import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsString } from 'class-validator';

export class Erc20AddressDto {
  @ApiProperty()
  @IsEthereumAddress()
  erc20Address: string;
}

export class Web3SignDto extends Erc20AddressDto {
  @ApiProperty()
  @IsString()
  pvKey: string;
}
