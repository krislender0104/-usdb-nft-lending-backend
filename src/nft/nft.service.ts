import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Collectible, CollectionInfo, FetchNFTClient } from '@danny-jin/fetch-nft';
import { Repository } from 'typeorm';

import { AssetListing } from '../asset-listing/entities/asset-listing.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Loan } from '../loan/entities/loan.entity';

import { AssetService } from '../asset/asset.service';
import { UserNotificationService } from '../user-notification/user-notification.service';
import { TransferHistoryService } from '../transfer-history/transfer-history.service';
import {
  ETH_RPC_URL,
  LENDING_CONTRACT_ADDRESS,
  OPENSEA_API_ENDPOINT,
  OPENSEA_API_KEY,
  RINKEBY_RPC_URL,
  TEST_LENDING_CONTRACT_ADDRESS,
  TEST_OPENSEA_API_ENDPOINT,
  TEST_OPENSEA_API_KEY
} from '../core/constants/base';
import { AssetListingStatus } from '../core/enums/asset-listing';
import { OfferStatus } from '../core/enums/offer';
import { NotificationContext, UserType } from '../core/enums/notification';
import { AssetStatus, AssetType } from '../core/enums/asset';
import * as Web3 from 'web3';
import { ERC1155ABI } from '../core/constants/abis';
import { UserService } from '../user/user.service';

@Injectable()
export class NftService {
  isDev = false;

  constructor(
    @InjectRepository(AssetListing)
    private readonly assetListingRepository: Repository<AssetListing>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private assetService: AssetService,
    private transferHistoryService: TransferHistoryService,
    private userNotificationService: UserNotificationService,
    private userService: UserService) {
    this.isDev = process.env.IS_DEV === 'true';
  }

  async getAll(wallet: string): Promise<Collectible[]> {
    const openSeaConfig = {
      apiKey: this.isDev ? TEST_OPENSEA_API_KEY : OPENSEA_API_KEY,
      apiEndpoint: this.isDev ? TEST_OPENSEA_API_ENDPOINT : OPENSEA_API_ENDPOINT
    };
    const fetchClient = new FetchNFTClient({ openSeaConfig });
    const collectibleState = await fetchClient.getEthereumCollectibles([
      wallet
    ]);
    return collectibleState[wallet] || [];
  }

  async getCollection(assetContractAddress: string, tokenId: string): Promise<CollectionInfo> {
    const openSeaConfig = {
      apiKey: this.isDev ? TEST_OPENSEA_API_KEY : OPENSEA_API_KEY,
      apiEndpoint: this.isDev ? TEST_OPENSEA_API_ENDPOINT : OPENSEA_API_ENDPOINT
    };
    const fetchClient = new FetchNFTClient({ openSeaConfig });
    return await fetchClient.getEthereumCollection(assetContractAddress, tokenId);
  }

  async getCurrentOwner(assetContractAddress: string, tokenId: string): Promise<string> {
    const openSeaConfig = {
      apiKey: this.isDev ? TEST_OPENSEA_API_KEY : OPENSEA_API_KEY,
      apiEndpoint: this.isDev ? TEST_OPENSEA_API_ENDPOINT : OPENSEA_API_ENDPOINT
    };
    const fetchClient = new FetchNFTClient({ openSeaConfig });
    return await fetchClient.getEthereumAssetOwner(assetContractAddress, tokenId);
  }

  async validateNft(assetId: string): Promise<boolean> {
    const asset = await this.assetService.findById(assetId);
    if (!asset) {
      throw new BadRequestException('Could not find requested asset.');
    }
    if (asset.type === AssetType.ERC1155) {
      try {
        const web3 = new (Web3 as any)(
          new (Web3 as any).providers.HttpProvider(this.isDev ? RINKEBY_RPC_URL : ETH_RPC_URL),
        );
        const erc1155Contract = new web3.eth.Contract(ERC1155ABI, asset.assetContractAddress);
        const quantity = await erc1155Contract.methods.balanceOf(asset.wallet, asset.tokenId);
        return quantity && Number(quantity) > 0;
      } catch (e) {
        throw new BadRequestException(e);
      }
    } else if (asset.type === AssetType.ERC721) {
      const currentOwner = await this.getCurrentOwner(asset.assetContractAddress, asset.tokenId);
      if (!currentOwner) {
        throw new BadRequestException(`We can't get the current owner of this asset.`);
      }
      const lendingContractAddress = this.isDev ? TEST_LENDING_CONTRACT_ADDRESS : LENDING_CONTRACT_ADDRESS;
      if (currentOwner.toLowerCase() === lendingContractAddress.toLowerCase()) {
        return true;
      }
      const found = await this.userService.findByAddress(currentOwner);
      if (!found) {
        throw new BadRequestException(`This asset is already transferred outside our platform.`);
      }
      try {
        if (currentOwner.toLowerCase() !== asset.owner.address.toLowerCase() || currentOwner.toLowerCase() !== asset.wallet.toLowerCase()) {
          for await (const assetListing of asset.assetListings) {
            for await (const offer of assetListing.offers) {
              offer.status = OfferStatus.Cancelled;
              await this.offerRepository.save(offer);
              const lenderNotificationPayload = {
                user: offer.lender,
                context: NotificationContext.OfferCancelled,
                contextId: offer.id,
                userType: UserType.Lender
              };
              await this.userNotificationService.create(lenderNotificationPayload);
            }
            const borrowerNotificationPayload = {
              user: asset.owner,
              context: NotificationContext.ListingCancelled,
              contextId: assetListing.id,
              userType: UserType.Borrower
            };
            await this.userNotificationService.create(borrowerNotificationPayload);
            assetListing.status = AssetListingStatus.Cancelled;
            await this.assetListingRepository.save(assetListing);
          }
          await this.transferHistoryService.create({
            assetContractAddress: asset.assetContractAddress,
            tokenId: Number(asset.tokenId),
            assetType: asset.type,
            from: asset.wallet,
            to: currentOwner
          });
          asset.status = AssetStatus.Transferred;
          await this.assetRepository.save(asset);
          return false;
        }
        return true;
      } catch(e) {
        throw new BadRequestException(e);
      }
    }
    return true;
  }
}
