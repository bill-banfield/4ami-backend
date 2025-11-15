import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { AssetClass } from '../../entities/asset-class.entity';
import { CreateAssetClassDto } from './dto/create-asset-class.dto';
import { UpdateAssetClassDto } from './dto/update-asset-class.dto';

@Injectable()
export class AssetClassesService {
  constructor(
    @InjectRepository(AssetClass)
    private readonly assetClassRepo: Repository<AssetClass>,
  ) {}

  async create(createAssetClassDto: CreateAssetClassDto): Promise<AssetClass> {
    const normalizedName = createAssetClassDto.name.toLowerCase().trim();

    // Check if asset class already exists for this industry
    const existing = await this.assetClassRepo.findOne({
      where: {
        industryId: createAssetClassDto.industryId,
        name: normalizedName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Asset class "${normalizedName}" already exists for this industry`,
      );
    }

    const assetClass = this.assetClassRepo.create(createAssetClassDto);
    return await this.assetClassRepo.save(assetClass);
  }

  async findAll(industryId?: number, search?: string): Promise<AssetClass[]> {
    const where: any = {};

    if (industryId) {
      where.industryId = industryId;
    }

    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      where.name = ILike(`%${normalizedSearch}%`);
    }

    return await this.assetClassRepo.find({
      where,
      relations: ['industry'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<AssetClass> {
    const assetClass = await this.assetClassRepo.findOne({
      where: { id },
      relations: ['industry'],
    });

    if (!assetClass) {
      throw new NotFoundException(`Asset class with ID ${id} not found`);
    }

    return assetClass;
  }

  async findOrCreate(industryId: number, name: string): Promise<AssetClass> {
    const normalizedName = name.toLowerCase().trim();

    let assetClass = await this.assetClassRepo.findOne({
      where: {
        industryId,
        name: normalizedName,
      },
    });

    if (!assetClass) {
      assetClass = this.assetClassRepo.create({
        industryId,
        name: normalizedName,
      });
      assetClass = await this.assetClassRepo.save(assetClass);
    }

    return assetClass;
  }

  async update(
    id: number,
    updateAssetClassDto: UpdateAssetClassDto,
  ): Promise<AssetClass> {
    const assetClass = await this.findOne(id);

    // If updating name, check for duplicates
    if (updateAssetClassDto.name) {
      const normalizedName = updateAssetClassDto.name.toLowerCase().trim();
      const existing = await this.assetClassRepo.findOne({
        where: {
          industryId: updateAssetClassDto.industryId || assetClass.industryId,
          name: normalizedName,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Asset class "${normalizedName}" already exists for this industry`,
        );
      }
    }

    Object.assign(assetClass, updateAssetClassDto);
    return await this.assetClassRepo.save(assetClass);
  }

  async remove(id: number): Promise<void> {
    const assetClass = await this.findOne(id);
    await this.assetClassRepo.remove(assetClass);
  }
}
