import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProjectType } from '../../entities/project-type.entity';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';

@Injectable()
export class ProjectTypesService {
  constructor(
    @InjectRepository(ProjectType)
    private projectTypeRepository: Repository<ProjectType>,
  ) {}

  async create(createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectType> {
    // Check if project type with the same code already exists
    const existingProjectType = await this.projectTypeRepository.findOne({
      where: { code: createProjectTypeDto.code },
    });

    if (existingProjectType) {
      throw new ConflictException(`Project type with code '${createProjectTypeDto.code}' already exists`);
    }

    const projectType = this.projectTypeRepository.create(createProjectTypeDto);
    return this.projectTypeRepository.save(projectType);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    projectTypes: ProjectType[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [projectTypes, total] = await this.projectTypeRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      projectTypes,
      total,
      page,
      limit,
    };
  }

  async findAllWithoutPagination(): Promise<ProjectType[]> {
    return this.projectTypeRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive(): Promise<ProjectType[]> {
    return this.projectTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProjectType> {
    const projectType = await this.projectTypeRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!projectType) {
      throw new NotFoundException('Project type not found');
    }

    return projectType;
  }

  async update(id: string, updateProjectTypeDto: UpdateProjectTypeDto): Promise<ProjectType> {
    const projectType = await this.projectTypeRepository.findOne({
      where: { id },
    });

    if (!projectType) {
      throw new NotFoundException('Project type not found');
    }

    // If code is being updated, check for conflicts
    if (updateProjectTypeDto.code && updateProjectTypeDto.code !== projectType.code) {
      const existingProjectType = await this.projectTypeRepository.findOne({
        where: { code: updateProjectTypeDto.code },
      });

      if (existingProjectType) {
        throw new ConflictException(`Project type with code '${updateProjectTypeDto.code}' already exists`);
      }
    }

    Object.assign(projectType, updateProjectTypeDto);
    return this.projectTypeRepository.save(projectType);
  }

  async remove(id: string): Promise<void> {
    const projectType = await this.projectTypeRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!projectType) {
      throw new NotFoundException('Project type not found');
    }

    // Check if there are projects using this project type
    if (projectType.projects && projectType.projects.length > 0) {
      throw new BadRequestException(
        `Cannot delete project type. It is currently used by ${projectType.projects.length} project(s)`
      );
    }

    await this.projectTypeRepository.remove(projectType);
  }
}
