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

import { Report } from '../../entities/report.entity';
import { Project } from '../../entities/project.entity';
import { Asset } from '../../entities/asset.entity';
import { User } from '../../entities/user.entity';
import { ReportStatus } from '../../common/enums/report-status.enum';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('report-generation')
    private reportGenerationQueue: Queue,
  ) {}

  async create(createReportDto: CreateReportDto, userId: string): Promise<Report> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate project if provided
    if (createReportDto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: createReportDto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const report = this.reportRepository.create({
      ...createReportDto,
      generatedById: userId,
    });

    const savedReport = await this.reportRepository.save(report);

    // Add report generation job to queue
    await this.reportGenerationQueue.add('generate-report', {
      reportId: savedReport.id,
      userId,
    });

    return savedReport;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    projectId?: string,
    userId?: string,
    userRole?: string,
  ): Promise<{
    reports: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoinAndSelect('report.generatedBy', 'generatedBy');

    // Filter by project if provided
    if (projectId) {
      queryBuilder.where('report.projectId = :projectId', { projectId });
    }

    // Filter by user if not admin
    if (userRole !== 'admin' && userId) {
      queryBuilder.andWhere('report.generatedById = :userId', { userId });
    }

    const [reports, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('report.createdAt', 'DESC')
      .getManyAndCount();

    return {
      reports,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<Report> {
    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoinAndSelect('report.generatedBy', 'generatedBy')
      .where('report.id = :id', { id });

    // Check permissions
    if (userRole !== 'admin' && userId) {
      queryBuilder.andWhere('report.generatedById = :userId', { userId });
    }

    const report = await queryBuilder.getOne();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    userId: string,
    userRole?: string,
  ): Promise<Report> {
    const report = await this.findOne(id, userId, userRole);

    // Check if user can update this report
    if (userRole !== 'admin' && report.generatedById !== userId) {
      throw new ForbiddenException('You can only update your own reports');
    }

    Object.assign(report, updateReportDto);
    return this.reportRepository.save(report);
  }

  async remove(id: string, userId: string, userRole?: string): Promise<void> {
    const report = await this.findOne(id, userId, userRole);

    // Check if user can delete this report
    if (userRole !== 'admin' && report.generatedById !== userId) {
      throw new ForbiddenException('You can only delete your own reports');
    }

    await this.reportRepository.remove(report);
  }

  async generateReport(
    projectId: string,
    reportType: string,
    userId: string,
  ): Promise<{ reportId: string; jobId: string; message: string }> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['assets', 'reports'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Create report record
    const report = this.reportRepository.create({
      name: `${project.name} - ${reportType} Report`,
      description: `Generated ${reportType} report for project ${project.name}`,
      projectId,
      generatedById: userId,
      metadata: { reportType, projectName: project.name },
    });

    const savedReport = await this.reportRepository.save(report);

    // Add report generation job to queue
    const job = await this.reportGenerationQueue.add('generate-report', {
      reportId: savedReport.id,
      projectId,
      reportType,
      userId,
    });

    return {
      reportId: savedReport.id,
      jobId: job.id.toString(),
      message: 'Report generation started',
    };
  }

  async getDashboardStats(userId?: string, userRole?: string): Promise<{
    totalReports: number;
    generatingReports: number;
    completedReports: number;
    failedReports: number;
  }> {
    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    // Filter by user if not admin
    if (userRole !== 'admin' && userId) {
      queryBuilder.where('report.generatedById = :userId', { userId });
    }

    const [
      totalReports,
      generatingReports,
      completedReports,
      failedReports,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('report.status = :status', { status: ReportStatus.GENERATING }).getCount(),
      queryBuilder.clone().andWhere('report.status = :status', { status: ReportStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('report.status = :status', { status: ReportStatus.FAILED }).getCount(),
    ]);

    return {
      totalReports,
      generatingReports,
      completedReports,
      failedReports,
    };
  }

  async downloadReport(id: string, userId: string, userRole?: string): Promise<{
    filePath: string;
    fileName: string;
    mimeType: string;
  }> {
    const report = await this.findOne(id, userId, userRole);

    if (report.status !== ReportStatus.COMPLETED) {
      throw new BadRequestException('Report is not ready for download');
    }

    if (!report.filePath) {
      throw new BadRequestException('Report file not found');
    }

    return {
      filePath: report.filePath,
      fileName: `${report.name}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  async getReportData(id: string, userId: string, userRole?: string): Promise<any> {
    const report = await this.findOne(id, userId, userRole);
    return report.data;
  }
}
