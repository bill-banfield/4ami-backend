import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  create(@Body() createReportDto: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(createReportDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('projectId') projectId?: string,
  ) {
    return this.reportsService.findAll(page, limit, projectId, user.id, user.role);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get report dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats(@CurrentUser() user: User) {
    return this.reportsService.getDashboardStats(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reportsService.findOne(id, user.id, user.role);
  }

  @Get(':id/data')
  @ApiOperation({ summary: 'Get report data' })
  @ApiResponse({ status: 200, description: 'Report data retrieved successfully' })
  getReportData(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reportsService.getReportData(id, user.id, user.role);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report file' })
  @ApiResponse({ status: 200, description: 'Report file downloaded' })
  async downloadReport(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const { filePath, fileName, mimeType } = await this.reportsService.downloadReport(
      id,
      user.id,
      user.role,
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath);
  }

  @Post('generate/:projectId')
  @ApiOperation({ summary: 'Generate report for project' })
  @ApiResponse({ status: 201, description: 'Report generation started' })
  generateReport(
    @Param('projectId') projectId: string,
    @Body('reportType') reportType: string,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.generateReport(projectId, reportType, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.update(id, updateReportDto, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reportsService.remove(id, user.id, user.role);
  }
}
