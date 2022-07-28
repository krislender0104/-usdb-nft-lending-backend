import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Asset } from './entities/asset.entity';
import { AssetDto } from './dto/asset.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { getFromDto } from '../core/utils/repository';
import { SuccessResponse } from '../core/models/response';
import { parseSortQuery } from '../core/utils/query';
import { AssetStatus } from '../core/enums/asset';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService
  ) {
    // this.removeDuplicationAsset().then();
  }

  // async removeDuplicationAsset() {
  //   console.log('asset start');
  //   const duplicationAsset = await this.connection.query("select * from asset");
  //   console.log('duplicationAsset count: ', duplicationAsset.length);
  //
  // }

  async saveAsset(payload: AssetDto, asset: Asset): Promise<Asset> {
    if (payload.owner) {
      if (typeof payload.owner === 'string') {
        const owner = await this.userService.findById(payload.owner);
        if (!owner) {
          throw new BadRequestException('This asset owner is not existing.');
        }
        asset.owner = owner;
      } else {
        let owner = getFromDto<User>(payload.owner, new User());
        owner = await this.userRepository.save(owner);
        asset.owner = owner;
      }
    }
    asset = await this.assetRepository.save(asset);
    return await this.findById(asset.id);
  }

  async create(payload: AssetDto, req: any, throwError = true): Promise<Asset> {
    let found = await this.findById(payload?.id);
    if (!found) {
      found = await this.findByContractAndTokenId(payload?.assetContractAddress, payload?.tokenId, req.user.address);
    }
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This asset is already taken.`);
      } else {
        return found;
      }
    }
    if (payload.owner.address.toLowerCase() !== req.user.address.toLowerCase()) {
      throw new BadRequestException('Requesting user has no permission to create.');
    }
    if (payload.owner.address.toLowerCase() !== payload.wallet.toLowerCase()) {
      throw new BadRequestException('Asset Owner address is different with the asset wallet address.');
    }
    let asset = getFromDto<Asset>(payload, new Asset());
    return await this.saveAsset(payload, asset);
  }

  async findById(id: string, findRemoved = false): Promise<Asset> {
    if (!id) {
      return null;
    }
    return this.assetRepository.findOne({
      relations: ['owner', 'assetListings', 'assetListings.offers'],
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  async findByContractAndTokenId(contractAddress: string, tokenId: string, walletAddress: string, findRemoved = false): Promise<Asset> {
    if (!contractAddress || !tokenId) {
      return null;
    }
    return this.assetRepository.findOne({
      relations: ['owner', 'assetListings', 'assetListings.offers'],
      withDeleted: findRemoved,
      order: {
        updatedAt: "DESC"
      },
      where: {
        assetContractAddress: contractAddress,
        tokenId: tokenId,
        wallet: walletAddress,
        status: Not(AssetStatus.Transferred)
      },
    });
  }

  async findAll(
    skip: number,
    take: number,
    status: string,
    openseaIds: string,
    contractAddress: string,
    tokenId: string,
    assetType: string,
    mediaType: string,
    sortQuery: string
  ): Promise<[Asset[], number]> {
    const statusClause = status
      ? `asset.status = 
      '${status}'`
      : 'true';
    const mediaTypeClause = mediaType
      ? `asset.mediaType = 
      '${mediaType}'`
      : 'true';
    const contractAddressClause = contractAddress
      ? `LOWER(asset.assetContractAddress) = 
      '${contractAddress.toLocaleLowerCase()}'`
      : 'true';
    const tokenIdClause = tokenId
      ? `asset.tokenId = 
      '${tokenId}'`
      : 'true';
    const assetTypeClause = assetType
      ? `asset.type = 
      '${assetType}'`
      : 'true';
    const openseaIdClause = openseaIds
      ? `:openseaIds LIKE '%' || asset.openseaId || '%'`
      : 'true';
    try {
      return await this.assetRepository
        .createQueryBuilder('asset')
        .leftJoinAndSelect('asset.owner', 'user')
        .where(statusClause)
        .andWhere(mediaTypeClause)
        .andWhere(contractAddressClause)
        .andWhere(tokenIdClause)
        .andWhere(assetTypeClause)
        .andWhere(openseaIdClause, { openseaIds })
        .orderBy(parseSortQuery(sortQuery))
        .skip(skip)
        .take(take)
        .getManyAndCount();
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async update(id: string, payload: AssetDto, req: any): Promise<Asset> {
    let asset = await this.findById(id);
    if (!asset) {
      throw new BadRequestException('Unable to update non-existing asset.');
    }
    if (asset.owner.address.toLowerCase() !== req.user.address.toLowerCase()) {
      throw new BadRequestException('Requesting user has no permission to update.');
    }
    if (asset.owner.address.toLowerCase() !== asset.wallet.toLowerCase() || asset.owner.address.toLowerCase() !== payload.wallet.toLowerCase()) {
      throw new BadRequestException('Asset Owner address is different with the asset wallet address.');
    }
    asset = getFromDto<Asset>(payload, new Asset());
    asset.id = id;
    return await this.saveAsset(payload, asset);
  }

  async remove(id: string): Promise<SuccessResponse> {
    const asset = await this.findById(id);
    if (!asset) {
      throw new BadRequestException('The requested asset does not exist.');
    }
    await this.assetRepository.softDelete({ id });
    return new SuccessResponse(true);
  }
}
