import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collection } from './entities/collection.entity';
import { CollectionDto } from './dto/collection.dto';
import { getFromDto } from '../core/utils/repository';
import { parseSortQuery } from '../core/utils/query';

@Injectable()
export class CollectionService {

  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
  ) {}

  async findAll(
    skip: number,
    take: number,
    contractAddress: string,
    slug: string,
    sortQuery: string): Promise<[Collection[], number]> {
    const contractAddressClause = contractAddress
      ? `collection.contractAddress LIKE '%' || :contractAddress || '%'`
      : 'true';
    const slugClause = slug
      ? `collection.slug = 
      '${slug}'`
      : 'true';
    return await this.collectionRepository
      .createQueryBuilder('collection')
      .where(slugClause)
      .andWhere(contractAddressClause, { contractAddress })
      .orderBy(parseSortQuery(sortQuery))
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async create(payload: CollectionDto, throwError = true): Promise<Collection> {
    const found = await this.findBySlug(payload?.slug);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This collection is already taken.`);
      } else {
        return found;
      }
    }
    const collection = getFromDto<Collection>(payload, new Collection());
    return await this.collectionRepository.save(collection);
  }

  async update(slug: string, payload: CollectionDto): Promise<Collection> {
    const originalCollection = await this.findBySlug(slug);
    if (!originalCollection) {
      throw new BadRequestException('Unable to update non-existing collection.');
    }
    const collection = getFromDto<Collection>(payload, new Collection());
    collection.id = originalCollection.id;
    return await this.collectionRepository.save(collection);
  }

  findBySlug(slug: string, findRemoved = false): Promise<Collection> {
    if (!slug) {
      return null;
    }
    return this.collectionRepository.findOne({
      withDeleted: findRemoved,
      where: { slug: slug },
    });
  }

}
