import { Injectable } from '@nestjs/common';
import * as Web3 from 'web3';

import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Web3SignDto } from '../core/dto/web3.dto';
import { ETH_RPC_URL, WEB3_SIGN_MESSAGE } from '../core/constants/base';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async login(payload: CreateUserDto): Promise<UpdateUserDto> {
    const user = await this.userService.create(payload, false);
    return user.toDto();
  }

  async findUserByAddress(address: string): Promise<User> {
    return await this.userService.findByAddress(address);
  }

  async generateWeb3Sign(payload: Web3SignDto): Promise<string> {
    const web3 = new (Web3 as any)(
      new (Web3 as any).providers.HttpProvider(ETH_RPC_URL),
    );
    const account = web3.eth.accounts.privateKeyToAccount(payload.pvKey);
    const sign = await account.sign(WEB3_SIGN_MESSAGE);
    return sign.signature;
  }
}
