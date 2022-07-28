import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NestInterceptor,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { isUUID } from 'class-validator';
import { diskStorage } from 'multer';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../core/guards/auth.guard';
import { SuccessResponse, FileResponse } from '../core/models/response';
import { PaginatorDto } from '../core/dto/paginator.dto';
import { DEFAULT_TAKE_COUNT } from '../core/constants/base';
import { editFileName, imageFileFilter } from '../core/utils/file';
import { UserPaginationDto } from './dto/user-pagination.dto';

@ApiTags('User Management')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOkResponse({ type: () => PaginatorDto })
  async users(
    @Query() query: UserPaginationDto,
    @Request() req,
  ): Promise<PaginatorDto<UpdateUserDto>> {
    const [data, count] = await this.userService.findAll(
      query.address,
      query.skip || 0,
      query.take || DEFAULT_TAKE_COUNT,
    );
    return {
      data: data.map((item: User) => {
        return item.toDto();
      }),
      count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => User })
  async user(@Param('id') id: string): Promise<User> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested user.');
    }
    return this.userService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiImplicitParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => User })
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateUserDto,
    @Request() req,
  ): Promise<UpdateUserDto> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested user.');
    }
    const updated = await this.userService.update(id, payload, req);
    return updated.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: () => SuccessResponse })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SuccessResponse> {
    if (!isUUID(id)) {
      throw new BadRequestException('Could not find requested user.');
    }
    return this.userService.remove(id);
  }

  @Post('upload-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }) as NestInterceptor | Function
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { // 👈 this property
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ type: () => FileResponse })
  async uploadedFile(@UploadedFile() file): Promise<FileResponse> {
    return {
      originalName: file.originalname,
      fileName: file.filename,
    };
  }

}
