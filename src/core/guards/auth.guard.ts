import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as Web3 from 'web3';

import { AuthService } from '../../auth/auth.service';
import { ETH_RPC_URL, WEB3_SIGN_MESSAGE } from '../constants/base';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers['authorization']) {
      return false;
    }
    const sign = request.headers['authorization'].replace('Bearer ', '');
    if (!sign) {
      return false;
    }
    const web3 = new (Web3 as any)(
      new (Web3 as any).providers.HttpProvider(ETH_RPC_URL),
    );
    try {
      const address = web3.eth.accounts.recover(WEB3_SIGN_MESSAGE, sign);
      if (!address) {
        return false;
      }
      const user = await this.authService.findUserByAddress(address);
      if (!!user) {
        request['user'] = user;
      }
      return !!user;
    } catch (e) {
      console.log(e);
    }
  }
}
