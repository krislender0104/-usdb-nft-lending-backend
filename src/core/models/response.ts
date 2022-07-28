import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class Response {
  @ApiProperty()
  readonly status: boolean;

  constructor() {
    this.status = true;
  }
}

export class SuccessResponse {
  @ApiProperty()
  @IsBoolean()
  readonly success: boolean;

  @ApiProperty()
  readonly message?: string;

  constructor(success: boolean, message = '') {
    this.success = success;
    this.message = message;
  }
}

export class FileResponse {
  @ApiProperty()
  @IsString()
  readonly originalName: string;

  @ApiProperty()
  @IsString()
  readonly fileName: string;

  constructor(originalName: string, fileName: string) {
    this.originalName = originalName;
    this.fileName = fileName;
  }
}

