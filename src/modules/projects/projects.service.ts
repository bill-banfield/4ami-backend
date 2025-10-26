import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { Company } from '../../entities/company.entity';
import { ProjectType } from '../../entities/project-type.entity';
import { ProjectClient } from '../../entities/project-client.entity';
import { ProjectSource } from '../../entities/project-source.entity';
import { ProjectEquipment } from '../../entities/project-equipment.entity';
import { ProjectFinancial } from '../../entities/project-financial.entity';
import { ProjectTransaction } from '../../entities/project-transaction.entity';
import { ProjectUtilizationScenario } from '../../entities/project-utilization-scenario.entity';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(ProjectType)
    private projectTypeRepository: Repository<ProjectType>,
    @InjectRepository(ProjectClient)
    private projectClientRepository: Repository<ProjectClient>,
    @InjectRepository(ProjectSource)
    private projectSourceRepository: Repository<ProjectSource>,
    @InjectRepository(ProjectEquipment)
    private projectEquipmentRepository: Repository<ProjectEquipment>,
    @InjectRepository(ProjectFinancial)
    private projectFinancialRepository: Repository<ProjectFinancial>,
    @InjectRepository(ProjectTransaction)
    private projectTransactionRepository: Repository<ProjectTransaction>,
    @InjectRepository(ProjectUtilizationScenario)
    private projectUtilizationScenarioRepository: Repository<ProjectUtilizationScenario>,
    private emailService: EmailService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    // Verify user exists and get companyId
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify project type exists and is active
    const projectType = await this.projectTypeRepository.findOne({
      where: { code: createProjectDto.projectTypeCode, isActive: true },
    });
    if (!projectType) {
      throw new BadRequestException('Invalid or inactive project type');
    }

    // Determine status:
    // - If status="draft" is provided → save as DRAFT (no emails)
    // - If no status provided → save as PENDING (send emails)
    // - Any other status → reject
    let projectStatus: ProjectStatus;
    if (createProjectDto.status) {
      if (createProjectDto.status === ProjectStatus.DRAFT) {
        projectStatus = ProjectStatus.DRAFT;
      } else {
        throw new BadRequestException('Only DRAFT status or no status (for immediate submission) is allowed during project creation');
      }
    } else {
      // No status provided = immediate submission = PENDING
      projectStatus = ProjectStatus.PENDING;
    }

    // Generate project number
    const projectNumber = await this.generateProjectNumber();

    // Determine submitDate
    const submitDate = projectStatus === ProjectStatus.PENDING ? new Date() : null;

    // Create base project
    const project = this.projectRepository.create({
      projectNumber,
      name: createProjectDto.name,
      description: createProjectDto.description,
      startDate: createProjectDto.startDate,
      endDate: createProjectDto.endDate,
      metadata: createProjectDto.metadata,
      status: projectStatus,
      submitDate: submitDate,
      companyId: user.companyId,
      projectTypeId: projectType.id,
      createdById: userId,
    });

    const savedProject = await this.projectRepository.save(project);
    // Create related entities if provided

    if (createProjectDto.client) {
      const client = this.projectClientRepository.create({
        ...createProjectDto.client,
        projectId: savedProject.id,
      });
      await this.projectClientRepository.save(client);
    }

    if (createProjectDto.source) {
      const source = this.projectSourceRepository.create({
        ...createProjectDto.source,
        projectId: savedProject.id,
      });
      await this.projectSourceRepository.save(source);
    }

    if (createProjectDto.financial) {
      const financial = this.projectFinancialRepository.create({
        ...createProjectDto.financial,
        projectId: savedProject.id,
      });
      await this.projectFinancialRepository.save(financial);
    }

    if (createProjectDto.transaction) {
      const transaction = this.projectTransactionRepository.create({
        ...createProjectDto.transaction,
        projectId: savedProject.id,
      });
      await this.projectTransactionRepository.save(transaction);
    }

    if (createProjectDto.equipments && createProjectDto.equipments.length > 0) {
      const equipments = createProjectDto.equipments.map((eq) =>
        this.projectEquipmentRepository.create({
          ...eq,
          projectId: savedProject.id,
        }),
      );
      await this.projectEquipmentRepository.save(equipments);
    }

    if (createProjectDto.utilizationScenarios && createProjectDto.utilizationScenarios.length > 0) {
      const scenarios = createProjectDto.utilizationScenarios.map((scenario) =>
        this.projectUtilizationScenarioRepository.create({
          ...scenario,
          projectId: savedProject.id,
        }),
      );
      await this.projectUtilizationScenarioRepository.save(scenarios);
    }

    // Return project with all relations
    const fullProject = await this.findOne(savedProject.id, userId, user.role);

    // Send email notifications ONLY if project status is PENDING (i.e., submitted immediately)
    if (projectStatus === ProjectStatus.PENDING) {
      this.sendProjectCreationNotifications(fullProject, user).catch((error) => {
        console.error('Failed to send project creation notifications:', error);
        // Don't fail the project creation if email fails
      });
    }

    return fullProject;
  }

  private async sendProjectCreationNotifications(project: Project, creator: User): Promise<void> {
    try {
      // Get company details
      const company = await this.companyRepository.findOne({
        where: { id: project.companyId },
      });

      if (!company) {
        console.error('Company not found for project notification');
        return;
      }

      // Build recipient list
      const recipients: string[] = [];

      // 1. Get all system admins (users with ADMIN role)
      const systemAdmins = await this.userRepository.find({
        where: {
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      const systemAdminEmails = systemAdmins.map((admin) => admin.email);
      recipients.push(...systemAdminEmails);

      // 2. Get all CUSTOMER_ADMIN users from the same company
      const companyAdmins = await this.userRepository.find({
        where: {
          companyId: project.companyId,
          role: UserRole.CUSTOMER_ADMIN,
          isActive: true,
        },
      });

      const companyAdminEmails = companyAdmins.map((admin) => admin.email);
      recipients.push(...companyAdminEmails);

      // Remove duplicates
      const uniqueRecipients = [...new Set(recipients)];

      if (uniqueRecipients.length === 0) {
        console.warn('No recipients found for project creation notification');
        return;
      }

      // Send notification
      await this.emailService.sendProjectCreationNotification(
        project,
        creator,
        company,
        uniqueRecipients,
      );

      console.log(`✅ Project creation notifications queued for ${uniqueRecipients.length} recipients (${systemAdminEmails.length} system admins + ${companyAdminEmails.length} company admins)`);
    } catch (error) {
      console.error('Error in sendProjectCreationNotifications:', error);
      throw error;
    }
  }

  private async generateProjectNumber(): Promise<string> {
    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const year = new Date().getFullYear();

        // Find the highest existing project number for the current year
        // This prevents duplicates even if projects are deleted
        const latestProject = await this.projectRepository
          .createQueryBuilder('project')
          .where('project.projectNumber LIKE :yearPattern', { yearPattern: `${year}%` })
          .orderBy('project.projectNumber', 'DESC')
          .limit(1)
          .getOne();

        let sequence = 1;

        if (latestProject && latestProject.projectNumber) {
          // Extract the sequence number from the latest project number
          // Format: YYYYSSSS (e.g., 20250001)
          const lastSequence = parseInt(latestProject.projectNumber.substring(4), 10);
          if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
          }
        }

        const sequenceStr = String(sequence).padStart(4, '0');
        const projectNumber = `${year}${sequenceStr}`;

        // Double-check for uniqueness (handles race conditions)
        const exists = await this.projectRepository.findOne({
          where: { projectNumber },
        });

        if (!exists) {
          return projectNumber;
        }

        // If duplicate found, increment attempt and try again
        attempt++;
      } catch (error) {
        console.error('Error generating project number:', error);
        attempt++;
      }
    }

    // Fallback: if all retries fail, use timestamp-based unique number
    const timestamp = Date.now().toString().slice(-6);
    const year = new Date().getFullYear();
    return `${year}${timestamp}`;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    userRole?: UserRole,
  ): Promise<{
    projects: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.createdBy', 'createdBy')
      .leftJoinAndSelect('project.company', 'company')
      .leftJoinAndSelect('project.assets', 'assets')
      .leftJoinAndSelect('project.reports', 'reports');

    // Apply role-based filtering
    if (userRole === UserRole.ADMIN) {
      // System Admin: See all projects EXCEPT DRAFT
      queryBuilder.where('project.status != :draftStatus', {
        draftStatus: ProjectStatus.DRAFT
      });
    } else if (userRole === UserRole.CUSTOMER_ADMIN && userId) {
      // Customer Admin: See all projects from their company EXCEPT DRAFT
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user && user.companyId) {
        queryBuilder
          .where('project.companyId = :companyId', { companyId: user.companyId })
          .andWhere('project.status != :draftStatus', {
            draftStatus: ProjectStatus.DRAFT
          });
      }
    } else if (userRole === UserRole.CUSTOMER_USER && userId) {
      // Customer User: See only their own DRAFT and PENDING projects
      queryBuilder
        .where('project.createdById = :userId', { userId })
        .andWhere('project.status IN (:...allowedStatuses)', {
          allowedStatuses: [ProjectStatus.DRAFT, ProjectStatus.PENDING]
        });
    } else if (userId) {
      // Fallback: if role not recognized, show only user's own projects
      queryBuilder.where('project.createdById = :userId', { userId });
    }

    const [projects, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('project.createdAt', 'DESC')
      .getManyAndCount();

    // Transform the response to include only specific fields for createdBy and company
    const transformedProjects = projects.map(project => ({
      ...project,
      createdBy: project.createdBy ? {
        id: project.createdBy.id,
        firstName: project.createdBy.firstName,
        lastName: project.createdBy.lastName,
      } : null,
      company: project.company ? {
        id: project.company.id,
        companyName: project.company.companyName,
      } : null,
    }));

    return {
      projects: transformedProjects,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId?: string, userRole?: UserRole): Promise<Project> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      // Select only specific fields for createdBy
      .leftJoin('project.createdBy', 'createdBy')
      .addSelect(['createdBy.id', 'createdBy.firstName', 'createdBy.lastName'])
      // Select only specific fields for company
      .leftJoin('project.company', 'company')
      .addSelect(['company.id', 'company.companyName'])
      // Select only specific fields for projectType
      .leftJoin('project.projectType', 'projectType')
      .addSelect(['projectType.id', 'projectType.name'])
      // Load all fields for these relations
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.source', 'source')
      .leftJoinAndSelect('project.financial', 'financial')
      .leftJoinAndSelect('project.transaction', 'transaction')
      .leftJoinAndSelect('project.equipments', 'equipments')
      .leftJoinAndSelect('project.utilizationScenarios', 'utilizationScenarios')
      .leftJoinAndSelect('project.assets', 'assets')
      .leftJoinAndSelect('project.reports', 'reports')
      .where('project.id = :id', { id });

    // Check permissions - scope by company
    if (userRole !== UserRole.ADMIN && userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user && user.companyId) {
        queryBuilder.andWhere('project.companyId = :companyId', { companyId: user.companyId });
      }
    }

    const project = await queryBuilder.getOne();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    userRole?: UserRole,
  ): Promise<Project> {
    const project = await this.findOne(id, userId, userRole);

    // Check if user can update this project
    if (userRole !== UserRole.ADMIN && project.createdById !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    // Track if status is changing from DRAFT to PENDING
    const wasInDraft = project.status === ProjectStatus.DRAFT;
    const isChangingToPending = updateProjectDto.status === ProjectStatus.PENDING;

    Object.assign(project, updateProjectDto);

    // Set submitDate when transitioning from DRAFT to PENDING
    if (wasInDraft && isChangingToPending && !project.submitDate) {
      project.submitDate = new Date();
    }

    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string, userRole?: UserRole): Promise<void> {
    const project = await this.findOne(id, userId, userRole);

    // Check if user can delete this project
    if (userRole !== UserRole.ADMIN && project.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectRepository.remove(project);
  }

  async getDashboardStats(userId?: string, userRole?: UserRole): Promise<{
    totalProjects: number;
    pendingProjects: number;
    inProgressProjects: number;
    completedProjects: number;
    cancelledProjects: number;
  }> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');

    // Filter by user if not admin
    if (userRole !== UserRole.ADMIN && userId) {
      queryBuilder.where('project.createdById = :userId', { userId });
    }

    const [
      totalProjects,
      pendingProjects,
      inProgressProjects,
      completedProjects,
      cancelledProjects,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('project.status = :status', { status: ProjectStatus.PENDING }).getCount(),
      queryBuilder.clone().andWhere('project.status = :status', { status: ProjectStatus.IN_PROGRESS }).getCount(),
      queryBuilder.clone().andWhere('project.status = :status', { status: ProjectStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('project.status = :status', { status: ProjectStatus.CANCELLED }).getCount(),
    ]);

    return {
      totalProjects,
      pendingProjects,
      inProgressProjects,
      completedProjects,
      cancelledProjects,
    };
  }

  async updateStatus(
    id: string,
    status: ProjectStatus,
    userId: string,
    userRole?: UserRole,
  ): Promise<Project> {
    const project = await this.findOne(id, userId, userRole);

    // Check if user can update this project
    if (userRole !== UserRole.ADMIN && project.createdById !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    project.status = status;
    return this.projectRepository.save(project);
  }

  async submitDraft(
    id: string,
    userId: string,
    userRole?: UserRole,
  ): Promise<Project> {
    const project = await this.findOne(id, userId, userRole);

    // Check if user can update this project
    if (userRole !== UserRole.ADMIN && project.createdById !== userId) {
      throw new ForbiddenException('You can only submit your own projects');
    }

    // Validate that project is in DRAFT status
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit project. Project is already in ${project.status} status. Only DRAFT projects can be submitted.`);
    }

    // Change status to PENDING and set submitDate
    project.status = ProjectStatus.PENDING;
    project.submitDate = new Date();

    const updatedProject = await this.projectRepository.save(project);

    // Get user details for email notification
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Send email notifications when draft is submitted
    if (user) {
      this.sendProjectCreationNotifications(updatedProject, user).catch((error) => {
        console.error('Failed to send project submission notifications:', error);
        // Don't fail the submission if email fails
      });
    }

    return updatedProject;
  }

  async getProjectTypes(): Promise<ProjectType[]> {
    return this.projectTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }
}
