import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserNotification } from './entities/user-notification.entity';
import { UserNotificationDto } from './dto/user-notification.dto';
import { getFromDto } from '../core/utils/repository';
import { SuccessResponse } from '../core/models/response';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { parseSortQuery } from '../core/utils/query';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService
  ) {
  }

  async saveUserNotification(payload: UserNotificationDto, userNotification: UserNotification): Promise<UserNotification> {
    if (payload.user) {
      if (typeof payload.user === 'string') {
        const owner = await this.userService.findById(payload.user);
        if (!owner) {
          throw new BadRequestException('This user notification owner is not existing.');
        }
        userNotification.user = owner;
      } else {
        let owner = getFromDto<User>(payload.user, new User());
        owner = await this.userRepository.save(owner);
        userNotification.user = owner;
      }
    }
    userNotification = await this.userNotificationRepository.save(userNotification);
    return await this.findById(userNotification.id);
  }

  async create(
    payload: UserNotificationDto,
    throwError = true
  ): Promise<UserNotification> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This notification is already taken.`);
      } else {
        return found;
      }
    }
    const userNotification = getFromDto<UserNotification>(
      payload,
      new UserNotification()
    );
    return await this.saveUserNotification(payload, userNotification);
  }

  async findById(id: string, findRemoved = false): Promise<UserNotification> {
    if (!id) {
      return null;
    }
    return this.userNotificationRepository.findOne({
      relations: ['user'],
      withDeleted: findRemoved,
      where: { id: id }
    });
  }

  async findAll(
    skip: number,
    take: number,
    status: string,
    context: string,
    contextId: string,
    userType: string,
    userAddress: string,
    sortQuery: string
  ): Promise<[UserNotification[], number]> {
    const statusClause = status
      ? `user_notification.status = 
      '${status}'`
      : 'true';
    const contextClause = context
      ? `user_notification.context = 
      '${context}'`
      : 'true';
    const contextIdClause = contextId
      ? `user_notification.contextId = 
      '${contextId}'`
      : 'true';
    const userTypeClause = userType
      ? `user_notification.userType = 
      '${userType}'`
      : 'true';
    const userAddressClause = userAddress
      ? `user.address = 
      '${userAddress}'`
      : 'true';
    return await this.userNotificationRepository
      .createQueryBuilder('user_notification')
      .leftJoinAndSelect('user_notification.user', 'user')
      .where(statusClause)
      .andWhere(contextClause)
      .andWhere(contextIdClause)
      .andWhere(userTypeClause)
      .andWhere(userAddressClause)
      .orderBy(parseSortQuery(sortQuery))
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async update(
    id: string,
    payload: UserNotificationDto,
    req: any
  ): Promise<UserNotification> {
    let userNotification = await this.findById(id);
    if (!userNotification) {
      throw new BadRequestException(
        'Unable to update non-existing user notification.'
      );
    }
    if (userNotification.user.address !== req.user.address) {
      throw new BadRequestException('Requesting user has no permission to update.');
    }
    if (userNotification.context !== payload.context ||
      userNotification.importance !== payload.importance) {
      payload.context = userNotification.context;
      payload.importance = userNotification.importance;
    }
    userNotification = getFromDto<UserNotification>(
      payload,
      new UserNotification()
    );
    userNotification.id = id;
    return await this.saveUserNotification(payload, userNotification);
  }

  async remove(id: string): Promise<SuccessResponse> {
    const notification = await this.findById(id);
    if (!notification) {
      throw new BadRequestException(
        'The requested notification does not exist.'
      );
    }
    await this.userNotificationRepository.softDelete({ id });
    return new SuccessResponse(true);
  }
}
