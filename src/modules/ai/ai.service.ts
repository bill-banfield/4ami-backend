import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

import { ProcessResidualAnalysisDto } from './dto/process-residual-analysis.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectQueue('ai-processing')
    private aiProcessingQueue: Queue,
    private configService: ConfigService,
  ) {}

  async processResidualAnalysis(
    processResidualAnalysisDto: ProcessResidualAnalysisDto,
  ): Promise<{ jobId: string; message: string }> {
    const job = await this.aiProcessingQueue.add('process-residual-analysis', processResidualAnalysisDto);
    
    return {
      jobId: job.id.toString(),
      message: 'Residual analysis processing started',
    };
  }

  async analyzeAssetData(assetData: any): Promise<{ jobId: string; message: string }> {
    const job = await this.aiProcessingQueue.add('analyze-asset-data', { assetData });
    
    return {
      jobId: job.id.toString(),
      message: 'Asset data analysis started',
    };
  }

  async generateInsights(projectId: string, data: any): Promise<{ jobId: string; message: string }> {
    const job = await this.aiProcessingQueue.add('generate-insights', { projectId, data });
    
    return {
      jobId: job.id.toString(),
      message: 'Insights generation started',
    };
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.aiProcessingQueue.getJob(jobId);
    
    if (!job) {
      return { status: 'not_found' };
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      result: job.returnvalue,
      error: job.failedReason,
    };
  }
}
