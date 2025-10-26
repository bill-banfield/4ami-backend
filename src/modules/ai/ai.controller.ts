import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AiService } from './ai.service';
import { ProcessResidualAnalysisDto } from './dto/process-residual-analysis.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('residual-analysis')
  @ApiOperation({ summary: 'Process residual analysis using AI' })
  @ApiResponse({ status: 201, description: 'Residual analysis processing started' })
  processResidualAnalysis(@Body() processResidualAnalysisDto: ProcessResidualAnalysisDto) {
    return this.aiService.processResidualAnalysis(processResidualAnalysisDto);
  }

  @Post('analyze-asset')
  @ApiOperation({ summary: 'Analyze asset data using AI' })
  @ApiResponse({ status: 201, description: 'Asset data analysis started' })
  analyzeAssetData(@Body('assetData') assetData: any) {
    return this.aiService.analyzeAssetData(assetData);
  }

  @Post('generate-insights/:projectId')
  @ApiOperation({ summary: 'Generate AI insights for project' })
  @ApiResponse({ status: 201, description: 'Insights generation started' })
  generateInsights(
    @Param('projectId') projectId: string,
    @Body('data') data: any,
  ) {
    return this.aiService.generateInsights(projectId, data);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get AI job status' })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  getJobStatus(@Param('jobId') jobId: string) {
    return this.aiService.getJobStatus(jobId);
  }
}
