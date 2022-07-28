import { Global, Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UserModule } from '../user/user.module';
import { AuthGuard } from '../core/guards/auth.guard';

@Global()
@Module({
  imports: [UserModule],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
