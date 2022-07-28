import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';

import { AssetListing } from './entities/asset-listing.entity';
import { Term } from '../term/entities/term.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetService } from '../asset/asset.service';
import { TermService } from '../term/term.service';
import { AssetListingDto } from './dto/asset-listing.dto';
import { UserService } from '../user/user.service';
import { NftService } from '../nft/nft.service';
import { CollectionService } from '../collection/collection.service';
import { SuccessResponse } from '../core/models/response';
import { AssetListingStatus } from '../core/enums/asset-listing';
import { AssetStatus } from '../core/enums/asset';
import { getFromDto } from '../core/utils/repository';
import { parseSortQuery } from '../core/utils/query';

@Injectable()
export class AssetListingService {
  isDev = false;

  constructor(
    @InjectRepository(AssetListing)
    private readonly assetListingRepository: Repository<AssetListing>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    private assetService: AssetService,
    private termService: TermService,
    private userService: UserService,
    private nftService: NftService,
    private collectionService: CollectionService
  ) {
    this.isDev = process.env.IS_DEV === 'true';
    // this.removeNullAssetListing().then();
    // this.setExpire().then();
  }

  // async removeNullAssetListing() {
  //   console.log('asset listing start');
  //   let nullAssetListing = await this.assetListingRepository
  //     .createQueryBuilder('asset_listing')
  //     .leftJoinAndSelect('asset_listing.asset', 'asset')
  //     .leftJoinAndSelect('asset.owner', 'user')
  //     .leftJoinAndSelect('asset_listing.term', 'term')
  //     .getMany();
  //   console.log('nullAssetListing count: ', nullAssetListing.length);
  //   nullAssetListing = nullAssetListing.filter((assetListing: any) => assetListing.asset === null);
  //   for await (const assetListing of nullAssetListing) {
  //     await this.remove(assetListing.id);
  //   }
  // }

  // async setExpire() {
  //   let expiredListings = await this.assetListingRepository
  //     .createQueryBuilder('asset_listing')
  //     .leftJoinAndSelect('asset_listing.asset', 'asset')
  //     .leftJoinAndSelect('asset.owner', 'user')
  //     .leftJoinAndSelect('asset_listing.term', 'term')
  //     .where(`asset_listing.createdAt < '2022-07-01T06:25:38.861Z'`)
  //     .andWhere(`asset_listing.status != '${AssetListingStatus.Completed}' and asset_listing.status != '${AssetListingStatus.Cancelled}' and asset_listing.status != '${AssetListingStatus.Expired}'`)
  //     .getMany();
  //   console.log('expiredListings: ', expiredListings.length);
  //   for await (const assetListing of expiredListings) {
  //     const asset = assetListing.asset;
  //     asset.status = AssetStatus.Ready;
  //     await this.assetRepository.save(asset);
  //     assetListing.status = AssetListingStatus.Expired;
  //     await this.assetListingRepository.save(assetListing);
  //   }
  //   console.log('finished:');
  // }

  async saveAssetListing(payload: AssetListingDto, assetListing: AssetListing): Promise<AssetListing> {
    if (payload.asset) {
      if (typeof payload.asset === 'string') {
        const asset = await this.assetService.findById(payload.asset);
        if (!asset) {
          throw new BadRequestException('This asset is not existing.');
        }
        assetListing.asset = asset;
      } else {
        let asset = getFromDto<Asset>(payload.asset, new Asset());
        if (payload.asset.owner) {
          if (typeof payload.asset.owner === 'string') {
            const owner = await this.userService.findById(payload.asset.owner);
            if (!owner) {
              throw new BadRequestException('This asset owner is not existing.');
            }
            asset.owner = owner;
          } else {
            let owner = getFromDto<User>(payload.asset.owner, new User());
            owner = await this.userRepository.save(owner);
            asset.owner = owner;
          }
        }
        if (asset.owner.address.toLowerCase() !== asset.wallet.toLowerCase()) {
          throw new BadRequestException('Asset Owner address is different with the asset wallet address.');
        }
        asset = await this.assetRepository.save(asset);
        assetListing.asset = asset;
      }
    }
    if (payload.term) {
      if (typeof payload.term === 'string') {
        const term = await this.termService.findById(payload.term);
        if (!term) {
          throw new BadRequestException('This term is not existing.');
        }
        assetListing.term = term;
      } else {
        let term = getFromDto<Term>(payload.term, new Term());
        term = await this.termRepository.save(term);
        assetListing.term = term;
      }
    }
    assetListing = await this.assetListingRepository.save(assetListing);
    return await this.findById(assetListing.id);
  }

  async create(
    payload: AssetListingDto,
    req: any,
    throwError = true,
  ): Promise<AssetListing> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This listed asset is already taken.`);
      } else {
        return found;
      }
    }
    if (!payload.asset || !payload.term) {
      throw new BadRequestException(`Bad Payload for create asset listing,`);
    }
    if (payload.asset.owner.address.toLowerCase() !== req.user.address.toLowerCase()) {
      throw new BadRequestException('Requesting user has no permission to create.');
    }
    let assetListing = getFromDto<AssetListing>(payload, new AssetListing());
    const checkDuplication = await this.assetListingRepository
      .createQueryBuilder('asset_listing')
      .leftJoinAndSelect('asset_listing.asset', 'asset')
      .leftJoinAndSelect('asset.owner', 'user')
      .leftJoinAndSelect('asset_listing.term', 'term')
      .where(`asset.assetContractAddress = '${assetListing.asset.assetContractAddress}'`)
      .andWhere(`asset.tokenId = '${assetListing.asset.tokenId}'`)
      .andWhere(`asset_listing.status != '${AssetListingStatus.Completed}' and asset_listing.status != '${AssetListingStatus.Cancelled}' and asset_listing.status != '${AssetListingStatus.Expired}'`)
      .getOne();
    if (checkDuplication) {
      throw new BadRequestException('This asset is already listed.');
    }
    const collectionInfo = await this.nftService.getCollection(assetListing.asset.assetContractAddress, assetListing.asset.tokenId);
    if (!this.isDev && collectionInfo.safeListRequestStatus !== 'verified') {
      throw new BadRequestException('This collection is not verified on Opensea.');
    }
    assetListing = await this.saveAssetListing(payload, assetListing);
    if (collectionInfo) {
      const collection = await this.collectionService.findBySlug(collectionInfo.slug);
      if (!collection) {
        if (assetListing.status === AssetListingStatus.Pending || assetListing.status === AssetListingStatus.Listed) {
          collectionInfo.openListingCount += 1;
        }
        await this.collectionService.create(collectionInfo);
      } else {
        if (assetListing.status === AssetListingStatus.Pending || assetListing.status === AssetListingStatus.Listed) {
          collection.openListingCount += 1;
        }
        await this.collectionRepository.save(collection);
      }
    }
    return assetListing;
  }

  async findById(id: string, findRemoved = false): Promise<AssetListing> {
    if (!id) {
      return null;
    }
    return this.assetListingRepository.findOne({
      relations: ['term', 'asset', 'asset.owner', 'offers'],
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  async findAll(
    skip: number,
    take: number,
    status: string,
    openseaIds: string,
    contractAddress: string,
    tokenId: string,
    borrower: string,
    keyword: string,
    currencyAddress: string,
    mediaType: string,
    minApr: string,
    maxApr: string,
    minDuration: string,
    maxDuration: string,
    minPrice: string,
    maxPrice: string,
    sortQuery: string,
  ): Promise<[AssetListing[], number]> {
    const statusClause = status
      ? `:status LIKE '%' || asset_listing.status::text || '%'`
      : 'true';
    const openseaIdClause = openseaIds
      ? `:openseaIds LIKE '%' || asset.openseaId || '%'`
      : 'true';
    const mediaTypeClause = mediaType
      ? `asset.mediaType = 
      '${mediaType}'`
      : 'true';
    const keywordClause = keyword
      ? `(asset.tokenId ilike :keyword
    or asset.name ilike :keyword
    or asset.description ilike :keyword
    or asset.assetContractAddress ilike :keyword
    or asset.externalLink ilike :keyword
    or asset.permaLink ilike :keyword)`
      : 'true';
    const currencyAddressClause = currencyAddress
      ? `LOWER(term.currencyAddress) = 
      '${currencyAddress.toLocaleLowerCase()}'`
      : 'true';
    const contractAddressClause = contractAddress
      ? `LOWER(asset.assetContractAddress) = 
      '${contractAddress.toLocaleLowerCase()}'`
      : 'true';
    const tokenIdClause = tokenId
      ? `asset.tokenId = 
      '${tokenId}'`
      : 'true';
    const minAprClause = minApr
      ? `term.apr >= 
      '${minApr}'`
      : 'true';
    const maxAprClause = maxApr
      ? `term.apr <= 
      '${maxApr}'`
      : 'true';
    const minDurationClause = minDuration
      ? `term.duration >= 
      '${minDuration}'`
      : 'true';
    const maxDurationClause = maxDuration
      ? `term.duration <= 
      '${maxDuration}'`
      : 'true';
    const minPriceClause = minPrice
      ? `term.amount >= 
      '${minPrice}'`
      : 'true';
    const maxPriceClause = maxPrice
      ? `term.amount <= 
      '${maxPrice}'`
      : 'true';
    const borrowerClause = borrower
      ? `user.address = 
      '${borrower}'`
      : 'true';
    try {
      return await this.assetListingRepository
        .createQueryBuilder('asset_listing')
        .leftJoinAndSelect('asset_listing.asset', 'asset')
        .leftJoinAndSelect('asset.owner', 'user')
        .leftJoinAndSelect('asset_listing.term', 'term')
        .where(keywordClause, { keyword: `%${keyword}%` })
        .andWhere(statusClause, { status })
        .andWhere(openseaIdClause, { openseaIds })
        .andWhere(mediaTypeClause)
        .andWhere(currencyAddressClause)
        .andWhere(contractAddressClause)
        .andWhere(tokenIdClause)
        .andWhere(borrowerClause)
        .andWhere(minAprClause)
        .andWhere(maxAprClause)
        .andWhere(minDurationClause)
        .andWhere(maxDurationClause)
        .andWhere(minPriceClause)
        .andWhere(maxPriceClause)
        .orderBy(parseSortQuery(sortQuery))
        .skip(skip)
        .take(take)
        .getManyAndCount();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(
    id: string,
    payload: AssetListingDto,
    req: any
  ): Promise<AssetListing> {
    let originalAssetListing = await this.findById(id);
    if (!originalAssetListing) {
      throw new BadRequestException(
        'Unable to update non-existing listed asset.',
      );
    }
    if (originalAssetListing.asset.owner.address !== req.user.address) {
      throw new BadRequestException('Requesting user has no permission to update.');
    }
    let assetListing = getFromDto<AssetListing>(payload, new AssetListing());
    assetListing.id = id;
    assetListing = await this.saveAssetListing(payload, assetListing);
    const collectionInfo = await this.nftService.getCollection(assetListing.asset.assetContractAddress, assetListing.asset.tokenId);
    if (collectionInfo) {
      const collection = await this.collectionService.findBySlug(collectionInfo.slug);
      if (collection) {
        if (originalAssetListing.status !== assetListing.status && (assetListing.status === AssetListingStatus.Cancelled || assetListing.status === AssetListingStatus.Completed)) {
          collection.openListingCount -= 1;
          collection.closeListingCount += 1;
        }
        await this.collectionRepository.save(collection);
      }
    }
    return assetListing;
  }

  async remove(id: string): Promise<SuccessResponse> {
    const assetListing = await this.findById(id);
    if (!assetListing) {
      throw new BadRequestException('The requested assetListing is not listed.');
    }
    await this.assetListingRepository.softDelete({ id });
    return new SuccessResponse(true);
  }

  @Cron('0 0 */3 * * *')
  // @Cron('0/2 * * * * *')
  async cleanExpire() {
    let expiredAssetListings = await this.assetListingRepository
      .createQueryBuilder('asset_listing')
      .leftJoinAndSelect('asset_listing.asset', 'asset')
      .leftJoinAndSelect('asset.owner', 'user')
      .leftJoinAndSelect('asset_listing.term', 'term')
      .andWhere(`term.expirationAt < '${new Date().toISOString()}'`)
      .andWhere(`asset_listing.status != '${AssetListingStatus.Completed}' and asset_listing.status != '${AssetListingStatus.Cancelled}' and asset_listing.status != '${AssetListingStatus.Expired}'`)
      .getMany();
    for await (const assetListing of expiredAssetListings) {
      const asset = assetListing.asset;
      asset.status = AssetStatus.Ready;
      await this.assetRepository.save(asset);
      assetListing.status = AssetListingStatus.Expired;
      await this.assetListingRepository.save(assetListing);
    }
  }
}
