import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { AssetStatus } from '../../common/enums/asset-status.enum';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
    userId: string,
  ): Promise<Equipment> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate project if provided
    if (createEquipmentDto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: createEquipmentDto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const equipment = this.equipmentRepository.create({
      ...createEquipmentDto,
      createdById: userId,
    });

    return this.equipmentRepository.save(equipment);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    projectId?: string,
    userId?: string,
    userRole?: string,
  ): Promise<{
    equipments: Equipment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.equipmentRepository
      .createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.project', 'project')
      .leftJoinAndSelect('equipment.createdBy', 'createdBy')
      .leftJoinAndSelect('equipment.industry', 'industry')
      .leftJoinAndSelect('equipment.assetClass', 'assetClass')
      .leftJoinAndSelect('equipment.make', 'make')
      .leftJoinAndSelect('equipment.model', 'model');

    // Filter by project if provided
    if (projectId) {
      queryBuilder.where('equipment.projectId = :projectId', { projectId });
    }

    // Filter by user if not admin
    if (userRole !== 'ADMIN' && userId) {
      queryBuilder.andWhere('equipment.createdById = :userId', { userId });
    }

    const [equipments, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('equipment.createdAt', 'DESC')
      .getManyAndCount();

    return {
      equipments,
      total,
      page,
      limit,
    };
  }

  async findOne(
    id: number,
    userId?: string,
    userRole?: string,
  ): Promise<Equipment> {
    const queryBuilder = this.equipmentRepository
      .createQueryBuilder('equipment')
      .leftJoinAndSelect('equipment.project', 'project')
      .leftJoinAndSelect('equipment.createdBy', 'createdBy')
      .leftJoinAndSelect('equipment.industry', 'industry')
      .leftJoinAndSelect('equipment.assetClass', 'assetClass')
      .leftJoinAndSelect('equipment.make', 'make')
      .leftJoinAndSelect('equipment.model', 'model')
      .where('equipment.id = :id', { id });

    // Check permissions
    if (userRole !== 'ADMIN' && userId) {
      queryBuilder.andWhere('equipment.createdById = :userId', { userId });
    }

    const equipment = await queryBuilder.getOne();

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    return equipment;
  }

  async update(
    id: number,
    updateEquipmentDto: UpdateEquipmentDto,
    userId: string,
    userRole?: string,
  ): Promise<Equipment> {
    const equipment = await this.findOne(id, userId, userRole);

    // Check if user can update this equipment
    if (userRole !== 'ADMIN' && equipment.createdById !== userId) {
      throw new ForbiddenException('You can only update your own equipment');
    }

    Object.assign(equipment, updateEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async remove(id: number, userId: string, userRole?: string): Promise<void> {
    const equipment = await this.findOne(id, userId, userRole);

    // Check if user can delete this equipment
    if (userRole !== 'ADMIN' && equipment.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own equipment');
    }

    await this.equipmentRepository.remove(equipment);
  }

  async getDashboardStats(
    userId?: string,
    userRole?: string,
  ): Promise<{
    totalEquipments: number;
    activeEquipments: number;
    inactiveEquipments: number;
    archivedEquipments: number;
    totalValue: number;
    totalResidualValue: number;
  }> {
    const queryBuilder =
      this.equipmentRepository.createQueryBuilder('equipment');

    // Filter by user if not admin
    if (userRole !== 'ADMIN' && userId) {
      queryBuilder.where('equipment.createdById = :userId', { userId });
    }

    const [
      totalEquipments,
      activeEquipments,
      inactiveEquipments,
      archivedEquipments,
      valueStats,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('equipment.status = :status', { status: AssetStatus.ACTIVE })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('equipment.status = :status', {
          status: AssetStatus.INACTIVE,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('equipment.status = :status', {
          status: AssetStatus.ARCHIVED,
        })
        .getCount(),
      queryBuilder
        .clone()
        .select('SUM(equipment.value)', 'totalValue')
        .addSelect('SUM(equipment.residualValue)', 'totalResidualValue')
        .getRawOne(),
    ]);

    return {
      totalEquipments,
      activeEquipments,
      inactiveEquipments,
      archivedEquipments,
      totalValue: parseFloat(valueStats.totalValue) || 0,
      totalResidualValue: parseFloat(valueStats.totalResidualValue) || 0,
    };
  }

  async updateStatus(
    id: number,
    status: AssetStatus,
    userId: string,
    userRole?: string,
  ): Promise<Equipment> {
    const equipment = await this.findOne(id, userId, userRole);

    // Check if user can update this equipment
    if (userRole !== 'ADMIN' && equipment.createdById !== userId) {
      throw new ForbiddenException('You can only update your own equipment');
    }

    equipment.status = status;
    return this.equipmentRepository.save(equipment);
  }
}
