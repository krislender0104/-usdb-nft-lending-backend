import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Term } from './entities/term.entity';
import { TermDto } from './dto/term.dto';
import { getFromDto } from '../core/utils/repository';
import { SuccessResponse } from '../core/models/response';

@Injectable()
export class TermService {
  constructor(
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  async create(payload: TermDto, throwError = true): Promise<Term> {
    const found = await this.findById(payload?.id);
    if (found) {
      if (throwError) {
        throw new BadRequestException(`This term is already taken.`);
      } else {
        return found;
      }
    }
    const term = getFromDto<Term>(payload, new Term());
    return await this.termRepository.save(term);
  }

  async findById(id: string, findRemoved = false): Promise<Term> {
    if (!id) {
      return null;
    }
    return this.termRepository.findOne({
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  findDetailById(id: string, findRemoved = false): Promise<Term> {
    if (!id) {
      return null;
    }
    return this.termRepository.findOne({
      relations: [
        'assetListing',
        'assetListing.asset',
        'assetListing.asset.owner',
        'offer',
        'offer.lender',
      ],
      withDeleted: findRemoved,
      where: { id: id },
    });
  }

  async findAll(skip: number, take: number): Promise<[Term[], number]> {
    return await this.termRepository
      .createQueryBuilder('term')
      .orderBy('term.createdAt', 'ASC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }

  async update(id: string, payload: TermDto, req: any): Promise<Term> {
    let term = await this.findDetailById(id);
    if (!term) {
      throw new BadRequestException('Unable to update non-existing term.');
    }
    if ((!term.offer && term.assetListing && term.assetListing.asset.owner.address !== req.user.address) ||
      (term.offer && term.offer.lender.address !== req.user.address)) {
      throw new BadRequestException('Requesting user has no permission to update.');
    }
    term = getFromDto<Term>(payload, new Term());
    term.id = id;
    return await this.termRepository.save(term);
  }

  async remove(id: string): Promise<SuccessResponse> {
    const term = await this.findById(id);
    if (!term) {
      throw new BadRequestException('The requested term does not exist.');
    }
    await this.termRepository.softDelete({ id });
    return new SuccessResponse(true);
  }
}
