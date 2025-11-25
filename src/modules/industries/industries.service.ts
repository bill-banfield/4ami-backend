import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Industry } from '../../entities/industry.entity';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@Injectable()
export class IndustriesService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepo: Repository<Industry>,
  ) {}

  async create(createIndustryDto: CreateIndustryDto): Promise<Industry> {
    // Convert to lowercase for searching
    const normalizedName = createIndustryDto.name.toLowerCase().trim();

    // Check if industry already exists
    const existing = await this.industryRepo.findOne({
      where: {
        name: normalizedName,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Industry "${normalizedName}" already exists`,
      );
    }

    const industry = this.industryRepo.create(createIndustryDto);
    return await this.industryRepo.save(industry);
  }

  async findAll(search?: string): Promise<Industry[]> {
    const where: any = {};

    if (search) {
      // Convert search term to lowercase
      const normalizedSearch = search.toLowerCase().trim();
      where.name = ILike(`%${normalizedSearch}%`);
    }

    return await this.industryRepo.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Industry> {
    const industry = await this.industryRepo.findOne({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException(`Industry with ID ${id} not found`);
    }

    return industry;
  }

  async findOrCreate(name: string): Promise<Industry> {
    const normalizedName = name.toLowerCase().trim();

    let industry = await this.industryRepo.findOne({
      where: {
        name: normalizedName,
      },
    });

    if (!industry) {
      industry = this.industryRepo.create({
        name: normalizedName,
      });
      industry = await this.industryRepo.save(industry);
    }

    return industry;
  }

  async update(
    id: number,
    updateIndustryDto: UpdateIndustryDto,
  ): Promise<Industry> {
    const industry = await this.findOne(id);

    // If updating name, check for duplicates
    if (updateIndustryDto.name) {
      const normalizedName = updateIndustryDto.name.toLowerCase().trim();
      const existing = await this.industryRepo.findOne({
        where: { name: normalizedName },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Industry "${normalizedName}" already exists`,
        );
      }
    }

    Object.assign(industry, updateIndustryDto);
    return await this.industryRepo.save(industry);
  }

  async remove(id: number): Promise<void> {
    const industry = await this.findOne(id);
    await this.industryRepo.remove(industry);
  }
}
