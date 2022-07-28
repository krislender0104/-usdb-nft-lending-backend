import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Web3SignDto } from '../core/dto/web3.dto';
import { SuccessResponse } from '../core/models/response';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: SuccessResponse })
  @Post('login')
  async login(@Body() body: CreateUserDto): Promise<UpdateUserDto> {
    return this.authService.login(body);
  }

  @ApiOkResponse({ type: SuccessResponse })
  @Get('web3-sign')
  async web3Sign(@Query() query: Web3SignDto) {
    return this.authService.generateWeb3Sign(query);
  }
}
