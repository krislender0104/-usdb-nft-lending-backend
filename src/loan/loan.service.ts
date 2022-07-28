import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Brackets, IsNull, Repository } from 'typeorm';

import { Loan } from './entities/loan.entity';
import { Offer } from '../offer/entities/offer.entity';
import { LoanDto } from './dto/loan.dto';
import { AssetService } from '../asset/asset.service';
import { AssetListingService } from '../asset-listing/asset-listing.service';
import { UserService } from '../user/user.service';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { TermService } from '../term/term.service';
import { Asset } from '../asset/entities/asset.entity';
import { Term } from '../term/entities/term.entity';
import { AssetListing } from '../asset-listing/entities/asset-listing.entity';
import { User } from '../user/entities/user.entity';
import { Collection } from '../collection/entities/collection.entity';
import { CollectionService } from '../collection/collection.service';
import { NftService } from '../nft/nft.service';
import { SuccessResponse } from '../core/models/response';
import { NotificationContext, UserType } from '../core/enums/notification';
import { LoanStatus } from '../core/enums/loan';
import { getFromDto } from '../core/utils/repository';
import { parseSortQuery } from '../core/utils/query';
import { OfferStatus } from '../core/enums/offer';
import { AssetStatus } from '../core/enums/asset';
import { AssetListingStatus } from '../core/enums/asset-listing';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AssetListing)
    private readonly assetListingRepository: Repository<AssetListing>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private assetService: AssetService,
    private termService: TermService,
    private assetListingService: AssetListingService,
    private userService: UserService,
    private userNotificationService: UserNotificationService,
    private collectionService: CollectionService,
    private nftService: NftService
  ) {
  }

  async saveLoan(payload: LoanDto, loan: Loan): Promise<Loan> {
    console.log('save loan started');
    console.log('loan: ', loan);
    if (payload.assetListing) {
      if (typeof payload.assetListing === 'string') {
        const assetListing = await this.assetListingService.findById(payload.assetListing);
        if (!assetListing) {
          throw new BadRequestException('This assetListing is not existing.');
        }
        loan.assetListing = assetListing;
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
        loan.assetListing = assetListing;
      }
    }
    if (payload.term) {
      if (typeof payload.term === 'string') {
        const term = await this.termService.findById(payload.term);
        if (!term) {
          throw new BadRequestException('This term is not existing.');
        }
        loan.term = term;
      } else {
        let term = getFromDto<Term>(payload.term, new Term());
        term = await this.termRepository.save(term);
        loan.term = term;
      }
    }
    if (payload.borrower) {
      if (typeof payload.borrower === 'string') {
        const borrower = await this.userService.findById(payload.borrower);
        if (!borrower) {
          throw new BadRequestException('This borrower is not existing.');
        }
        loan.borrower = borrower;
      } else {
        let borrower = getFromDto<User>(payload.borrower, new User());
        borrower = await this.userRepository.save(borrower);
        loan.borrower = borrower;
      }
    }
    if (payload.lender) {
      if (typeof payload.lender === 'string') {
        const lender = await this.userService.findById(payload.lender);
        if (!lender) {
          throw new BadRequestException('This lender is not existing.');
        }
        loan.lender = lender;
      } else {
        let lender = getFromDto<User>(payload.lender, new User());
        lender = await this.userRepository.save(lender);
        loan.lender = lender;
      }
    }
    loan = await this.loanRepository.save(loan);
    return await this.findById(loan.id);
  }

  async create(payload: LoanDto, req: any, throwError = true): Promise<Loan> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This loan is already taken.`);
      } else {
        return found;
      }
    }
    let loan = getFromDto<Loan>(payload, new Loan());
    loan = await this.saveLoan(payload, loan);

    const offers: Offer[] = loan.assetListing.offers;
    for await (let offer of offers) {
      if (offer.lender.address === loan.lender.address) {
        offer.status = OfferStatus.Accepted;
      } else {
        offer.status = OfferStatus.Cancelled;
      }
      await this.offerRepository.save(offer);
    }

    if (loan.contractLoanId) {
      const borrowerNotificationPayload = {
        user: loan.borrower,
        context: NotificationContext.NewLoan,
        contextId: loan.id,
        userType: UserType.Borrower
      };
      await this.userNotificationService.create(borrowerNotificationPayload);

      const lenderNotificationPayload = {
        user: loan.lender,
        context: NotificationContext.NewLoan,
        contextId: loan.id,
        userType: UserType.Lender
      };
      await this.userNotificationService.create(lenderNotificationPayload);
    }

    const collectionInfo = await this.nftService.getCollection(loan.assetListing.asset.assetContractAddress, loan.assetListing.asset.tokenId);
    if (collectionInfo) {
      const collection = await this.collectionService.findBySlug(collectionInfo.slug);
      if (!collection) {
        if (loan.status === LoanStatus.Active) {
          collectionInfo.openLoanCount += 1;
        }
        await this.collectionService.create(collectionInfo);
      } else {
        if (loan.status === LoanStatus.Active) {
          collection.openLoanCount += 1;
        }
        await this.collectionRepository.save(collection);
      }
    }
    return loan;
  }

  async findById(id: string, findRemoved = false): Promise<Loan> {
    if (!id) {
      return null;
    }
    return this.loanRepository.findOne({
      relations: [
        'lender',
        'borrower',
        'term',
        'assetListing',
        'assetListing.offers',
        'assetListing.offers.lender',
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
    walletAddress: string,
    status: string,
    contractLoanId: string,
    sortQuery: string,
  ): Promise<[Loan[], number]> {
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
      ? `borrower.address = 
      '${borrowerAddress}'`
      : 'true';
    const statusClause = status
      ? `:status LIKE '%' || loan.status::text || '%'`
      : 'true';
    const contractLoanIdClause = contractLoanId
      ? `loan.contractLoanId = 
      '${contractLoanId}'`
      : 'true';
    return await this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.borrower', 'borrower')
      .leftJoinAndSelect('loan.lender', 'lender')
      .leftJoinAndSelect('loan.term', 'term')
      .leftJoinAndSelect('loan.assetListing', 'assetListing')
      .leftJoinAndSelect('assetListing.term', 'assetListingTerm')
      .leftJoinAndSelect('assetListing.asset', 'asset')
      .leftJoinAndSelect('asset.owner', 'user')
      .where(assetIdClause)
      .andWhere(assetListingIdClause)
      .andWhere(statusClause, { status })
      .andWhere(contractLoanIdClause)
      .andWhere(new Brackets(qb => {
        qb.where(walletAddress ? `borrower.address = '${walletAddress}'` : 'true')
          .orWhere(walletAddress ? `lender.address = '${walletAddress}'` : 'true');
      }))
      .andWhere(lenderAddressClause)
      .andWhere(borrowerAddressClause)
      .orderBy(parseSortQuery(sortQuery))
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async getLenderLoans(lenderAddress: string): Promise<Loan[]> {
    const lenderAddressClause = lenderAddress
      ? `lender.address = 
      '${lenderAddress}'`
      : 'true';
    return await this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.borrower', 'borrower')
      .leftJoinAndSelect('loan.lender', 'lender')
      .leftJoinAndSelect('loan.term', 'term')
      .leftJoinAndSelect('loan.assetListing', 'assetListing')
      .leftJoinAndSelect('assetListing.term', 'assetListingTerm')
      .leftJoinAndSelect('assetListing.asset', 'asset')
      .leftJoinAndSelect('asset.owner', 'user')
      .addOrderBy('loan.createdAt', 'ASC')
      .where(lenderAddressClause)
      .getMany();
  }

  async getBorrowerLoans(borrowerAddress: string): Promise<Loan[]> {
    const borrowerAddressClause = borrowerAddress
      ? `borrower.address = 
      '${borrowerAddress}'`
      : 'true';
    return await this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.borrower', 'borrower')
      .leftJoinAndSelect('loan.lender', 'lender')
      .leftJoinAndSelect('loan.term', 'term')
      .leftJoinAndSelect('loan.assetListing', 'assetListing')
      .leftJoinAndSelect('assetListing.term', 'assetListingTerm')
      .leftJoinAndSelect('assetListing.asset', 'asset')
      .leftJoinAndSelect('asset.owner', 'user')
      .addOrderBy('loan.createdAt', 'ASC')
      .where(borrowerAddressClause)
      .getMany();
  }

  async update(id: string, payload: LoanDto): Promise<Loan> {
    let originalLoan = await this.findById(id);
    if (!originalLoan) {
      throw new BadRequestException('Unable to update non-existing loan.');
    }
    let loan = getFromDto<Loan>(payload, new Loan());
    loan.id = id;
    loan = await this.saveLoan(payload, loan);
    if (loan.contractLoanId && originalLoan.status !== LoanStatus.Complete &&
      loan.status === payload.status &&
      payload.status === LoanStatus.Complete) {
      const borrowerNotificationPayload = {
        user: loan.borrower,
        context: NotificationContext.Repayment,
        contextId: loan.id,
        userType: UserType.Borrower
      };
      await this.userNotificationService.create(borrowerNotificationPayload);
      const lenderNotificationPayload = {
        user: loan.lender,
        context: NotificationContext.Repayment,
        contextId: loan.id,
        userType: UserType.Lender
      };
      await this.userNotificationService.create(lenderNotificationPayload);
    }
    if (loan.contractLoanId && originalLoan.status !== LoanStatus.Default &&
      loan.status === payload.status &&
      payload.status === LoanStatus.Default) {
      const borrowerNotificationPayload = {
        user: loan.borrower,
        context: NotificationContext.Liquidation,
        contextId: loan.id,
        userType: UserType.Borrower
      };
      await this.userNotificationService.create(borrowerNotificationPayload);
      const lenderNotificationPayload = {
        user: loan.lender,
        context: NotificationContext.Liquidation,
        contextId: loan.id,
        userType: UserType.Lender
      };
      await this.userNotificationService.create(lenderNotificationPayload);
    }
    const collectionInfo = await this.nftService.getCollection(loan.assetListing.asset.assetContractAddress, loan.assetListing.asset.tokenId);
    if (collectionInfo) {
      const collection = await this.collectionService.findBySlug(collectionInfo.slug);
      if (collection) {
        if (originalLoan.status !== loan.status && (loan.status === LoanStatus.Default || loan.status === LoanStatus.Complete)) {
          collection.openLoanCount -= 1;
          collection.closeLoanCount += 1;
        }
        await this.collectionRepository.save(collection);
      }
    }
    return loan;
  }

  async remove(id: string): Promise<SuccessResponse> {
    const loan = await this.findById(id);
    if (!loan) {
      throw new BadRequestException('The requested loan does not exist.');
    }
    await this.loanRepository.softDelete({ id });
    return new SuccessResponse(true);
  }

  async resetStatus(loan: Loan, req = null): Promise<Boolean> {
    if (req && req.user.address.toLowerCase() !== loan.lender.address.toLowerCase() && req.user.address.toLowerCase() !== loan.borrower.address.toLowerCase()) {
      throw new BadRequestException('Requesting user has no permission to update.');
    }
    try {
      const assetListing = loan.assetListing;
      assetListing.status = AssetListingStatus.Listed;
      await this.assetListingRepository.save(assetListing);
      const asset = loan.assetListing.asset;
      asset.status = AssetStatus.Listed;
      await this.assetRepository.save(asset);
      const offers = assetListing.offers.filter(offer => offer.lender.address.toLowerCase() === loan.lender.address.toLowerCase());
      for await (const offer of offers) {
        offer.status = OfferStatus.Ready;
        await this.offerRepository.save(offer);
      }
      await this.loanRepository.delete({ id: loan.id });
    } catch {
      throw new BadRequestException('Failed to reset the status of asset, asset-listing, offer when loan is removed.');
    }
    return true;
  }

  @Cron('0 */10 * * * *')
  async cleanLoan() {
    console.log('clean loan started');
    const noContractLoans = await this.loanRepository.find({
      relations: [
        'lender',
        'borrower',
        'term',
        'assetListing',
        'assetListing.offers',
        'assetListing.offers.lender',
        'assetListing.asset',
        'assetListing.asset.owner',
        'assetListing.term'
      ],
      where: { contractLoanId: IsNull() }
    });
    for await (const loan of noContractLoans) {
      await this.resetStatus(loan);
    }
  }
}
