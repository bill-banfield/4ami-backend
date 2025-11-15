import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Make } from '../../entities/make.entity';
import { CreateMakeDto } from './dto/create-make.dto';
import { UpdateMakeDto } from './dto/update-make.dto';

@Injectable()
export class MakesService {
  constructor(
    @InjectRepository(Make)
    private readonly makeRepo: Repository<Make>,
  ) {}

  async create(createMakeDto: CreateMakeDto): Promise<Make> {
    const normalizedName = createMakeDto.name.toLowerCase().trim();

    // Check if make already exists for this industry and asset class
    const existing = await this.makeRepo.findOne({
      where: {
        industryId: createMakeDto.industryId,
        assetClassId: createMakeDto.assetClassId,
        name: normalizedName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Make "${normalizedName}" already exists for this industry and asset class`,
      );
    }

    const make = this.makeRepo.create(createMakeDto);
    return await this.makeRepo.save(make);
  }

  async findAll(
    industryId?: number,
    assetClassId?: number,
    search?: string,
  ): Promise<Make[]> {
    const where: any = {};

    if (industryId) {
      where.industryId = industryId;
    }

    if (assetClassId) {
      where.assetClassId = assetClassId;
    }

    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      where.name = ILike(`%${normalizedSearch}%`);
    }

    return await this.makeRepo.find({
      where,
      relations: ['industry', 'assetClass'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Make> {
    const make = await this.makeRepo.findOne({
      where: { id },
      relations: ['industry', 'assetClass'],
    });

    if (!make) {
      throw new NotFoundException(`Make with ID ${id} not found`);
    }

    return make;
  }

  async findOrCreate(
    industryId: number,
    assetClassId: number,
    name: string,
  ): Promise<Make> {
    const normalizedName = name.toLowerCase().trim();

    let make = await this.makeRepo.findOne({
      where: {
        industryId,
        assetClassId,
        name: normalizedName,
      },
    });

    if (!make) {
      make = this.makeRepo.create({
        industryId,
        assetClassId,
        name: normalizedName,
      });
      make = await this.makeRepo.save(make);
    }

    return make;
  }

  async update(id: number, updateMakeDto: UpdateMakeDto): Promise<Make> {
    const make = await this.findOne(id);

    // If updating name, check for duplicates
    if (updateMakeDto.name) {
      const normalizedName = updateMakeDto.name.toLowerCase().trim();
      const existing = await this.makeRepo.findOne({
        where: {
          industryId: updateMakeDto.industryId || make.industryId,
          assetClassId: updateMakeDto.assetClassId || make.assetClassId,
          name: normalizedName,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Make "${normalizedName}" already exists for this industry and asset class`,
        );
      }
    }

    Object.assign(make, updateMakeDto);
    return await this.makeRepo.save(make);
  }

  async remove(id: number): Promise<void> {
    const make = await this.findOne(id);
    await this.makeRepo.remove(make);
  }
}
