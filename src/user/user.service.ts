import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { getFromDto } from '../core/utils/repository';
import { SuccessResponse } from '../core/models/response';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(payload: CreateUserDto, throwError = true): Promise<User> {
    const found = await this.findByAddress(payload.address);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`Address is already taken.`);
      } else {
        return found;
      }
    }
    const user = getFromDto<User>(payload, new User());
    return await this.userRepository.save(user);
  }

  async findByAddress(address: string): Promise<User> {
    if (!address) {
      return null;
    }
    const addressClause = address
      ? `LOWER(user.address) = 
      '${address.toLowerCase()}'`
      : 'true';
    return await this.userRepository
      .createQueryBuilder('user')
      .where(addressClause)
      .getOne();
  }

  async findById(id: string, findRemoved = false): Promise<User> {
    if (!id) {
      return null;
    }
    return this.userRepository.findOne({
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  async findAll(address: string, skip: number, take: number): Promise<[User[], number]> {
    const addressClause = address
      ? `LOWER(user.address) = 
      '${address.toLowerCase()}'`
      : 'true';
    return await this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'ASC')
      .where(addressClause)
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async update(id: string, payload: UpdateUserDto, req: any): Promise<User> {
    let user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('Unable to update non-existing user.');
    }
    if (user.address !== req.user.address) {
`      throw new BadRequestException('Requesting user has no permission to update.');
`    }
    user = getFromDto<User>(payload, new User());
    user.id = id;
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<SuccessResponse> {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('The requested user does not exist.');
    }
    await this.userRepository.softDelete({ id });
    return new SuccessResponse(true);
  }

}
