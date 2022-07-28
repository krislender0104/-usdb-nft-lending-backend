import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SystemNotification } from './entities/system-notification.entity';
import { SystemNotificationDto } from './dto/system-notification.dto';
import { SuccessResponse } from '../core/models/response';
import { getFromDto } from '../core/utils/repository';
import { parseSortQuery } from '../core/utils/query';

@Injectable()
export class SystemNotificationService {
  constructor(
    @InjectRepository(SystemNotification)
    private readonly systemNotificationRepository: Repository<SystemNotification>,
  ) {}

  async create(
    payload: SystemNotificationDto,
    throwError = true,
  ): Promise<SystemNotification> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This notification is already taken.`);
      } else {
        return found;
      }
    }
    const notification = getFromDto<SystemNotification>(
      payload,
      new SystemNotification(),
    );
    return await this.systemNotificationRepository.save(notification);
  }

  async findById(id: string, findRemoved = false): Promise<SystemNotification> {
    if (!id) {
      return null;
    }
    return this.systemNotificationRepository.findOne({
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  async findAll(
    skip: number,
    take: number,
    sortQuery: string,
    skipExpiration = true,
  ): Promise<[SystemNotification[], number]> {
    const expirationClause =
      String(skipExpiration) === 'true'
        ? `system_notification."expirationAt" > 
      '${new Date().toISOString()}'`
        : 'true';
    return await this.systemNotificationRepository
      .createQueryBuilder('system_notification')
      .where(expirationClause)
      .orderBy(parseSortQuery(sortQuery))
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async update(
    id: string,
    payload: SystemNotification,
  ): Promise<SystemNotification> {
    let notification = await this.findById(id);
    if (!notification) {
      throw new BadRequestException(
        'Unable to update non-existing notification.',
      );
    }
    notification = getFromDto<SystemNotification>(
      payload,
      new SystemNotification(),
    );
    notification.id = id;
    return await this.systemNotificationRepository.save(notification);
  }

  async remove(id: string): Promise<SuccessResponse> {
    const notification = await this.findById(id);
    if (!notification) {
      throw new BadRequestException(
        'The requested notification does not exist.',
      );
    }
    await this.systemNotificationRepository.softDelete({ id });
    return new SuccessResponse(true);
  }
}
