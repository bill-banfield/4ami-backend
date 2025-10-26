import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { Asset } from '../../entities/asset.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { AssetStatus } from '../../common/enums/asset-status.enum';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { BulkImportDto } from './dto/bulk-import.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('asset-import')
    private assetImportQueue: Queue,
  ) {}

  async create(createAssetDto: CreateAssetDto, userId: string): Promise<Asset> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate project if provided
    if (createAssetDto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: createAssetDto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const asset = this.assetRepository.create({
      ...createAssetDto,
      createdById: userId,
    });

    return this.assetRepository.save(asset);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    projectId?: string,
    userId?: string,
    userRole?: string,
  ): Promise<{
    assets: Asset[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.project', 'project')
      .leftJoinAndSelect('asset.createdBy', 'createdBy');

    // Filter by project if provided
    if (projectId) {
      queryBuilder.where('asset.projectId = :projectId', { projectId });
    }

    // Filter by user if not admin
    if (userRole !== 'admin' && userId) {
      queryBuilder.andWhere('asset.createdById = :userId', { userId });
    }

    const [assets, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('asset.createdAt', 'DESC')
      .getManyAndCount();

    return {
      assets,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<Asset> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.project', 'project')
      .leftJoinAndSelect('asset.createdBy', 'createdBy')
      .leftJoinAndSelect('asset.residualForms', 'residualForms')
      .where('asset.id = :id', { id });

    // Check permissions
    if (userRole !== 'admin' && userId) {
      queryBuilder.andWhere('asset.createdById = :userId', { userId });
    }

    const asset = await queryBuilder.getOne();

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(
    id: string,
    updateAssetDto: UpdateAssetDto,
    userId: string,
    userRole?: string,
  ): Promise<Asset> {
    const asset = await this.findOne(id, userId, userRole);

    // Check if user can update this asset
    if (userRole !== 'admin' && asset.createdById !== userId) {
      throw new ForbiddenException('You can only update your own assets');
    }

    Object.assign(asset, updateAssetDto);
    return this.assetRepository.save(asset);
  }

  async remove(id: string, userId: string, userRole?: string): Promise<void> {
    const asset = await this.findOne(id, userId, userRole);

    // Check if user can delete this asset
    if (userRole !== 'admin' && asset.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own assets');
    }

    await this.assetRepository.remove(asset);
  }

  async bulkImport(
    bulkImportDto: BulkImportDto,
    userId: string,
  ): Promise<{ jobId: string; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate project if provided
    if (bulkImportDto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: bulkImportDto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    // Add job to queue
    const job = await this.assetImportQueue.add('bulk-import', {
      ...bulkImportDto,
      userId,
    });

    return {
      jobId: job.id.toString(),
      message: 'Bulk import job started',
    };
  }

  async getDashboardStats(userId?: string, userRole?: string): Promise<{
    totalAssets: number;
    activeAssets: number;
    inactiveAssets: number;
    archivedAssets: number;
    totalValue: number;
    totalResidualValue: number;
  }> {
    const queryBuilder = this.assetRepository.createQueryBuilder('asset');

    // Filter by user if not admin
    if (userRole !== 'admin' && userId) {
      queryBuilder.where('asset.createdById = :userId', { userId });
    }

    const [
      totalAssets,
      activeAssets,
      inactiveAssets,
      archivedAssets,
      valueStats,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('asset.status = :status', { status: AssetStatus.ACTIVE }).getCount(),
      queryBuilder.clone().andWhere('asset.status = :status', { status: AssetStatus.INACTIVE }).getCount(),
      queryBuilder.clone().andWhere('asset.status = :status', { status: AssetStatus.ARCHIVED }).getCount(),
      queryBuilder.clone()
        .select('SUM(asset.value)', 'totalValue')
        .addSelect('SUM(asset.residualValue)', 'totalResidualValue')
        .getRawOne(),
    ]);

    return {
      totalAssets,
      activeAssets,
      inactiveAssets,
      archivedAssets,
      totalValue: parseFloat(valueStats.totalValue) || 0,
      totalResidualValue: parseFloat(valueStats.totalResidualValue) || 0,
    };
  }

  async updateStatus(
    id: string,
    status: AssetStatus,
    userId: string,
    userRole?: string,
  ): Promise<Asset> {
    const asset = await this.findOne(id, userId, userRole);

    // Check if user can update this asset
    if (userRole !== 'admin' && asset.createdById !== userId) {
      throw new ForbiddenException('You can only update your own assets');
    }

    asset.status = status;
    return this.assetRepository.save(asset);
  }

  async generateAssetForm(projectId?: string): Promise<{
    formFields: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  }> {
    // This would typically come from a configuration or database
    const formFields = [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: false },
      { name: 'type', type: 'select', required: true, options: ['equipment', 'vehicle', 'property', 'other'] },
      { name: 'value', type: 'number', required: true },
      { name: 'residualValue', type: 'number', required: false },
      { name: 'purchaseDate', type: 'date', required: false },
      { name: 'location', type: 'text', required: false },
      { name: 'serialNumber', type: 'text', required: false },
    ];

    return { formFields };
  }
}
