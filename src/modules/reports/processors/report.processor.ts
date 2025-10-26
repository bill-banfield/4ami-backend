import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Report } from '../../../entities/report.entity';
import { Project } from '../../../entities/project.entity';
import { Asset } from '../../../entities/asset.entity';
import { ReportStatus } from '../../../common/enums/report-status.enum';

@Processor('report-generation')
@Injectable()
export class ReportProcessor {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  @Process('generate-report')
  async handleReportGeneration(job: Job<{
    reportId: string;
    projectId?: string;
    reportType?: string;
    userId: string;
  }>) {
    const { reportId, projectId, reportType = 'general' } = job.data;
    
    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
        relations: ['project'],
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Update report status to generating
      report.status = ReportStatus.GENERATING;
      await this.reportRepository.save(report);

      let reportData: any = {};
      let fileName = '';

      switch (reportType) {
        case 'asset_analysis':
          reportData = await this.generateAssetAnalysisReport(projectId);
          fileName = `asset-analysis-${Date.now()}.pdf`;
          break;
        case 'residual_analysis':
          reportData = await this.generateResidualAnalysisReport(projectId);
          fileName = `residual-analysis-${Date.now()}.pdf`;
          break;
        case 'project_summary':
          reportData = await this.generateProjectSummaryReport(projectId);
          fileName = `project-summary-${Date.now()}.pdf`;
          break;
        default:
          reportData = await this.generateGeneralReport(projectId);
          fileName = `general-report-${Date.now()}.pdf`;
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'reports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      
      // In a real implementation, you would generate a PDF here
      // For now, we'll create a JSON file as a placeholder
      fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2));

      // Update report with generated data and file path
      report.data = reportData;
      report.filePath = filePath;
      report.fileUrl = `/uploads/reports/${fileName}`;
      report.status = ReportStatus.COMPLETED;
      report.generatedAt = new Date();

      await this.reportRepository.save(report);

      return {
        reportId,
        status: 'completed',
        filePath,
        data: reportData,
      };
    } catch (error) {
      console.error('Report generation error:', error);
      
      // Update report status to failed
      const report = await this.reportRepository.findOne({
        where: { id: reportId },
      });
      
      if (report) {
        report.status = ReportStatus.FAILED;
        report.metadata = {
          ...report.metadata,
          error: error.message,
        };
        await this.reportRepository.save(report);
      }

      throw error;
    }
  }

  private async generateAssetAnalysisReport(projectId?: string): Promise<any> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.project', 'project');

    if (projectId) {
      queryBuilder.where('asset.projectId = :projectId', { projectId });
    }

    const assets = await queryBuilder.getMany();

    const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const totalResidualValue = assets.reduce((sum, asset) => sum + (asset.residualValue || 0), 0);

    return {
      reportType: 'asset_analysis',
      generatedAt: new Date(),
      summary: {
        totalAssets: assets.length,
        totalValue,
        totalResidualValue,
        averageValue: assets.length > 0 ? totalValue / assets.length : 0,
      },
      assets: assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        value: asset.value,
        residualValue: asset.residualValue,
        status: asset.status,
        projectName: asset.project?.name,
      })),
    };
  }

  private async generateResidualAnalysisReport(projectId?: string): Promise<any> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.project', 'project')
      .where('asset.residualValue IS NOT NULL');

    if (projectId) {
      queryBuilder.andWhere('asset.projectId = :projectId', { projectId });
    }

    const assets = await queryBuilder.getMany();

    const residualAnalysis = assets.map(asset => {
      const depreciation = (asset.value || 0) - (asset.residualValue || 0);
      const depreciationRate = asset.value ? (depreciation / asset.value) * 100 : 0;
      
      return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        originalValue: asset.value,
        residualValue: asset.residualValue,
        depreciation,
        depreciationRate,
        projectName: asset.project?.name,
      };
    });

    return {
      reportType: 'residual_analysis',
      generatedAt: new Date(),
      summary: {
        totalAssets: assets.length,
        totalOriginalValue: assets.reduce((sum, asset) => sum + (asset.value || 0), 0),
        totalResidualValue: assets.reduce((sum, asset) => sum + (asset.residualValue || 0), 0),
        totalDepreciation: residualAnalysis.reduce((sum, item) => sum + item.depreciation, 0),
      },
      analysis: residualAnalysis,
    };
  }

  private async generateProjectSummaryReport(projectId?: string): Promise<any> {
    if (!projectId) {
      throw new Error('Project ID is required for project summary report');
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['assets', 'reports'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalAssetValue = project.assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const totalResidualValue = project.assets.reduce((sum, asset) => sum + (asset.residualValue || 0), 0);

    return {
      reportType: 'project_summary',
      generatedAt: new Date(),
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt,
      },
      summary: {
        totalAssets: project.assets.length,
        totalReports: project.reports.length,
        totalAssetValue,
        totalResidualValue,
        averageAssetValue: project.assets.length > 0 ? totalAssetValue / project.assets.length : 0,
      },
      assets: project.assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        value: asset.value,
        residualValue: asset.residualValue,
        status: asset.status,
      })),
    };
  }

  private async generateGeneralReport(projectId?: string): Promise<any> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.project', 'project');

    if (projectId) {
      queryBuilder.where('asset.projectId = :projectId', { projectId });
    }

    const assets = await queryBuilder.getMany();

    return {
      reportType: 'general',
      generatedAt: new Date(),
      summary: {
        totalAssets: assets.length,
        totalValue: assets.reduce((sum, asset) => sum + (asset.value || 0), 0),
        totalResidualValue: assets.reduce((sum, asset) => sum + (asset.residualValue || 0), 0),
      },
      assets: assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        value: asset.value,
        residualValue: asset.residualValue,
        status: asset.status,
        projectName: asset.project?.name,
      })),
    };
  }
}
