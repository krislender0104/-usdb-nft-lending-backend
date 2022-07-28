import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Offer } from './entities/offer.entity';
import { Term } from '../term/entities/term.entity';
import { OfferDto } from './dto/offer.dto';
import { TermService } from '../term/term.service';
import { Asset } from '../asset/entities/asset.entity';
import { AssetListing } from '../asset-listing/entities/asset-listing.entity';
import { User } from '../user/entities/user.entity';
import { AssetService } from '../asset/asset.service';
import { AssetListingService } from '../asset-listing/asset-listing.service';
import { UserService } from '../user/user.service';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { NotificationContext, UserType } from '../core/enums/notification';
import { OfferStatus } from '../core/enums/offer';
import { SuccessResponse } from '../core/models/response';
import { getFromDto } from '../core/utils/repository';
import { parseSortQuery } from '../core/utils/query';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AssetListing)
    private readonly assetListingRepository: Repository<AssetListing>,
    private assetService: AssetService,
    private assetListingService: AssetListingService,
    private userService: UserService,
    private termService: TermService,
    private userNotificationService: UserNotificationService
  ) {
  }

  async saveOffer(payload: OfferDto, offer: Offer): Promise<Offer> {
    if (payload.assetListing) {
      if (typeof payload.assetListing === 'string') {
        const assetListing = await this.assetListingService.findById(payload.assetListing);
        if (!assetListing) {
          throw new BadRequestException('This assetListing is not existing.');
        }
        offer.assetListing = assetListing;
      } else {
        if (typeof payload.assetListing.asset === 'string') {
          const asset = await this.assetService.findById(payload.assetListing.asset);
          if (!asset) {
            throw new BadRequestException('This asset is not existing.');
          }
          payload.assetListing.asset = asset;
        } else {
          let asset = getFromDto<Asset>(payload.assetListing.asset, new Asset());
          if (payload.assetListing.asset.owner) {
            if (typeof payload.assetListing.asset.owner === 'string') {
              const owner = await this.userService.findById(payload.assetListing.asset.owner);
              if (!owner) {
                throw new BadRequestException('This asset owner is not existing.');
              }
              asset.owner = owner;
            } else {
              let owner = getFromDto<User>(payload.assetListing.asset.owner, new User());
              owner = await this.userRepository.save(owner);
              asset.owner = owner;
            }
          }
          if (asset.owner.address.toLowerCase() !== asset.wallet.toLowerCase()) {
            throw new BadRequestException('Asset Owner address is different with the asset wallet address.');
          }
          asset = await this.assetRepository.save(asset);
          payload.assetListing.asset = asset;
        }
        if (typeof payload.assetListing.term === 'string') {
          const term = await this.termService.findById(payload.assetListing.term);
          if (!term) {
            throw new BadRequestException('This term is not existing.');
          }
          payload.assetListing.term = term;
        } else {
          let term = getFromDto<Term>(payload.assetListing.term, new Term());
          term = await this.termRepository.save(term);
          payload.assetListing.term = term;
        }
        let assetListing = getFromDto<AssetListing>(payload.assetListing, new AssetListing());
        assetListing = await this.assetListingRepository.save(assetListing);
        offer.assetListing = assetListing;
      }
    }
    if (payload.term) {
      if (typeof payload.term === 'string') {
        const term = await this.termService.findById(payload.term);
        if (!term) {
          throw new BadRequestException('This term is not existing.');
        }
        offer.term = term;
      } else {
        let term = getFromDto<Term>(payload.term, new Term());
        term = await this.termRepository.save(term);
        offer.term = term;
      }
    }
    if (payload.lender) {
      if (typeof payload.lender === 'string') {
        const lender = await this.userService.findById(payload.lender);
        if (!lender) {
          throw new BadRequestException('This lender is not existing.');
        }
        offer.lender = lender;
      } else {
        let lender = getFromDto<User>(payload.lender, new User());
        lender = await this.userRepository.save(lender);
        offer.lender = lender;
      }
    }
    offer = await this.offerRepository.save(offer);
    return await this.findById(offer.id);
  }

  async create(payload: OfferDto, req: any, throwError = true): Promise<Offer> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This offer is already taken.`);
      } else {
        return found;
      }
    }
    if (payload.lender.address.toLowerCase() !== req.user.address.toLowerCase()) {
      throw new BadRequestException('Requesting user has no permission to create.');
    }
    let offer = getFromDto<Offer>(payload, new Offer());
    offer = await this.saveOffer(payload, offer);
    const borrowerNotificationPayload = {
      user: offer.assetListing.asset.owner,
      context: NotificationContext.NewOffer,
      contextId: offer.assetListing.id,
      userType: UserType.Borrower
    };
    await this.userNotificationService.create(borrowerNotificationPayload);
    const lenderNotificationPayload = {
      user: offer.lender,
      context: NotificationContext.NewOffer,
      contextId: offer.assetListing.id,
      userType: UserType.Lender
    };
    await this.userNotificationService.create(lenderNotificationPayload);
    return offer;
  }

  async findById(id: string, findRemoved = false): Promise<Offer> {
    if (!id) {
      return null;
    }
    return this.offerRepository.findOne({
      relations: [
        'lender',
        'assetListing',
        'term',
        'assetListing.asset',
        'assetListing.asset.owner',
        'assetListing.term'
      ],
      withDeleted: findRemoved,
      where: { id: id }
    });
  }

  async findAll(
    skip: number,
    take: number,
    assetId: string,
    assetListingId: string,
    lenderAddress: string,
    borrowerAddress: string,
    status: string,
    sortQuery: string): Promise<[Offer[], number]> {
    const assetIdClause = assetId
      ? `asset.id = 
      '${assetId}'`
      : 'true';
    const assetListingIdClause = assetListingId
      ? `assetListing.id = 
      '${assetListingId}'`
      : 'true';
    const lenderAddressClause = lenderAddress
      ? `lender.address = 
      '${lenderAddress}'`
      : 'true';
    const borrowerAddressClause = borrowerAddress
      ? `user.address = 
      '${borrowerAddress}'`
      : 'true';
    const statusClause = status
      ? `:status LIKE '%' || offer.status::text || '%'`
      : 'true';
    return await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.lender', 'lender')
      .leftJoinAndSelect('offer.assetListing', 'assetListing')
      .leftJoinAndSelect('assetListing.asset', 'asset')
      .leftJoinAndSelect('assetListing.term', 'assetListingTerm')
      .leftJoinAndSelect('offer.term', 'term')
      .leftJoinAndSelect('asset.owner', 'user')
      .where(assetIdClause)
      .andWhere(assetListingIdClause)
      .andWhere(lenderAddressClause)
      .andWhere(borrowerAddressClause)
      .andWhere(statusClause, { status })
      .orderBy(parseSortQuery(sortQuery))
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async update(id: string, payload: OfferDto, req: any): Promise<Offer> {
    const originOffer = await this.findById(id);
    let offer = await this.findById(id);
    if (!offer) {
      throw new BadRequestException('Unable to update non-existing offer.');
    }
    if (offer.lender.address !== req.user.address && offer.assetListing.asset.owner.address !== req.user.address) {
      throw new BadRequestException('Requesting user has no permission to update.');
    }
    offer = getFromDto<Offer>(payload, new Offer());
    offer.id = id;
    offer = await this.saveOffer(payload, offer);
    if (originOffer.status !== offer.status && offer.status === OfferStatus.Accepted) {
      const borrowerNotificationPayload = {
        user: offer.assetListing.asset.owner,
        context: NotificationContext.OfferAccepted,
        contextId: offer.id,
        userType: UserType.Borrower
      };
      await this.userNotificationService.create(borrowerNotificationPayload);
      const lenderNotificationPayload = {
        user: offer.lender,
        context: NotificationContext.OfferAccepted,
        contextId: offer.id,
        userType: UserType.Lender
      };
      await this.userNotificationService.create(lenderNotificationPayload);
    }
    return offer;
  }

  async remove(id: string): Promise<SuccessResponse> {
    const offer = await this.findById(id);
    if (!offer) {
      throw new BadRequestException('The requested offer does not exist.');
    }
    await this.offerRepository.softDelete({ id });
    return new SuccessResponse(true);
  }
}
