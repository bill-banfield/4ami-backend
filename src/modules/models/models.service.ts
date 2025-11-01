import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Model } from '../../entities/model.entity';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepo: Repository<Model>,
  ) {}

  async create(createModelDto: CreateModelDto): Promise<Model> {
    const normalizedName = createModelDto.name.toLowerCase().trim();

    // Check if model already exists for this industry, asset class, and make
    const existing = await this.modelRepo.findOne({
      where: {
        industryId: createModelDto.industryId,
        assetClassId: createModelDto.assetClassId,
        makeId: createModelDto.makeId,
        name: normalizedName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Model "${normalizedName}" already exists for this make`,
      );
    }

    const model = this.modelRepo.create(createModelDto);
    return await this.modelRepo.save(model);
  }

  async findAll(
    industryId?: number,
    assetClassId?: number,
    makeId?: number,
    search?: string,
  ): Promise<Model[]> {
    const where: any = {};

    if (industryId) {
      where.industryId = industryId;
    }

    if (assetClassId) {
      where.assetClassId = assetClassId;
    }

    if (makeId) {
      where.makeId = makeId;
    }

    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      where.name = ILike(`%${normalizedSearch}%`);
    }

    return await this.modelRepo.find({
      where,
      relations: ['industry', 'assetClass', 'make'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Model> {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: ['industry', 'assetClass', 'make'],
    });

    if (!model) {
      throw new NotFoundException(`Model with ID ${id} not found`);
    }

    return model;
  }

  async findOrCreate(
    industryId: number,
    assetClassId: number,
    makeId: number,
    name: string,
  ): Promise<Model> {
    const normalizedName = name.toLowerCase().trim();

    let model = await this.modelRepo.findOne({
      where: {
        industryId,
        assetClassId,
        makeId,
        name: normalizedName,
      },
    });

    if (!model) {
      model = this.modelRepo.create({
        industryId,
        assetClassId,
        makeId,
        name: normalizedName,
      });
      model = await this.modelRepo.save(model);
    }

    return model;
  }

  async update(id: number, updateModelDto: UpdateModelDto): Promise<Model> {
    const model = await this.findOne(id);

    // If updating name, check for duplicates
    if (updateModelDto.name) {
      const normalizedName = updateModelDto.name.toLowerCase().trim();
      const existing = await this.modelRepo.findOne({
        where: {
          industryId: updateModelDto.industryId || model.industryId,
          assetClassId: updateModelDto.assetClassId || model.assetClassId,
          makeId: updateModelDto.makeId || model.makeId,
          name: normalizedName,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Model "${normalizedName}" already exists for this make`,
        );
      }
    }

    Object.assign(model, updateModelDto);
    return await this.modelRepo.save(model);
  }

  async remove(id: number): Promise<void> {
    const model = await this.findOne(id);
    await this.modelRepo.remove(model);
  }
}
