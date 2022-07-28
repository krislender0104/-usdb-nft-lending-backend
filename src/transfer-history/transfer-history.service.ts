import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransferHistory } from './entities/transfer-history.entity';
import { TransferHistoryDto } from './dto/transfer-history.dto';
import { getFromDto } from '../core/utils/repository';
import { SuccessResponse } from '../core/models/response';

@Injectable()
export class TransferHistoryService {
  constructor(
    @InjectRepository(TransferHistory)
    private readonly transferHistoryRepository: Repository<TransferHistory>,
  ) {}

  async create(payload: TransferHistoryDto, throwError = true): Promise<TransferHistory> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This transferHistory is already taken.`);
      } else {
        return found;
      }
    }
    const transferHistory = getFromDto<TransferHistory>(payload, new TransferHistory());
    return await this.transferHistoryRepository.save(transferHistory);
  }

  async findById(id: string, findRemoved = false): Promise<TransferHistory> {
    if (!id) {
      return null;
    }
    return this.transferHistoryRepository.findOne({
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  async findAll(
    skip: number,
    take: number,
    assetContractAddress: string,
    tokenId: string,
    assetType: string,
    from: string,
    to: string,
  ): Promise<[TransferHistory[], number]> {
    const assetContractAddressClause = assetContractAddress
      ? `LOWER(transferHistory.assetContractAddress) = 
      '${assetContractAddress.toLocaleLowerCase()}'`
      : 'true';
    const tokenIdClause = tokenId
      ? `transferHistory.tokenId = 
      '${tokenId}'`
      : 'true';
    const assetTypeClause = assetType
      ? `transferHistory.assetType = 
      '${assetType}'`
      : 'true';
    const fromClause = from
      ? `LOWER(transferHistory.from) = 
      '${from.toLocaleLowerCase()}'`
      : 'true';
    const toClause = to
      ? `LOWER(transferHistory.to) = 
      '${to.toLocaleLowerCase()}'`
      : 'true';
    return await this.transferHistoryRepository
      .createQueryBuilder('transferHistory')
      .orderBy('transferHistory.createdAt', 'ASC')
      .where(assetContractAddressClause)
      .andWhere(tokenIdClause)
      .andWhere(assetTypeClause)
      .andWhere(fromClause)
      .andWhere(toClause)
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async update(id: string, payload: TransferHistoryDto): Promise<TransferHistory> {
    let transferHistory = await this.findById(id);
    if (!transferHistory) {
      throw new BadRequestException('Unable to update non-existing transferHistory.');
    }
    transferHistory = getFromDto<TransferHistory>(payload, new TransferHistory());
    transferHistory.id = id;
    return await this.transferHistoryRepository.save(transferHistory);
  }

  async remove(id: string): Promise<SuccessResponse> {
    const transferHistory = await this.findById(id);
    if (!transferHistory) {
      throw new BadRequestException('The requested transferHistory does not exist.');
    }
    await this.transferHistoryRepository.softDelete({ id });
    return new SuccessResponse(true);
  }
}
