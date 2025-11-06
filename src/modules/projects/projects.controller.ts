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
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFiles,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import type { Express } from 'express';
import { createReadStream } from 'fs';
import { plainToInstance } from 'class-transformer';
import { multerOptions } from '../../config/file-upload.config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get available project types' })
  @ApiResponse({ status: 200, description: 'Project types retrieved successfully' })
  getProjectTypes() {
    return this.projectsService.getProjectTypes();
  }

  @Get('sources')
  @ApiOperation({ summary: 'Get all project sources associated with the current user' })
  @ApiResponse({ status: 200, description: 'Project sources retrieved successfully' })
  getUserProjectSources(@CurrentUser() user: User) {
    return this.projectsService.getUserProjectSources(user.id, user.role);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({ summary: 'Create a new project with optional file attachments' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  create(
    @Body('projectData') projectDataString: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    // Parse projectData JSON string to DTO and transform nested objects
    const parsedData = projectDataString ? JSON.parse(projectDataString) : {};
    const createProjectDto = plainToInstance(CreateProjectDto, parsedData);
    return this.projectsService.create(createProjectDto, user.id, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.findAll(page, limit, user.id, user.role);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get project dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats(@CurrentUser() user: User) {
    return this.projectsService.getDashboardStats(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.update(id, updateProjectDto, user.id, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({ status: 200, description: 'Project status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ProjectStatus,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.updateStatus(id, status, user.id, user.role);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a draft project (changes status from DRAFT to PENDING and sends notifications)' })
  @ApiResponse({ status: 200, description: 'Draft project submitted successfully' })
  @ApiResponse({ status: 400, description: 'Project is not in DRAFT status' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  submitDraft(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.submitDraft(id, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.remove(id, user.id, user.role);
  }

  // ========== File Attachment Endpoints ==========

  @Post(':projectId/attachments')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({ summary: 'Upload attachments to an existing project' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async uploadAttachments(
    @Param('projectId') projectId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    const attachments = await this.projectsService.uploadAttachments(
      projectId,
      files,
      user.id,
      user.role,
    );
    return {
      success: true,
      message: `${attachments.length} file(s) uploaded successfully`,
      data: attachments,
    };
  }

  @Get(':projectId/attachments')
  @ApiOperation({ summary: 'Get all attachments for a project' })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getAttachments(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.getProjectAttachments(
      projectId,
      user.id,
      user.role,
    );
  }

  @Get(':projectId/attachments/:attachmentId/download')
  @ApiOperation({ summary: 'Download a project attachment' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async downloadAttachment(
    @Param('projectId') projectId: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { filePath, fileName, mimeType } =
      await this.projectsService.getAttachmentForDownload(
        projectId,
        attachmentId,
        user.id,
        user.role,
      );

    const file = createReadStream(filePath);
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':projectId/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete a project attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async deleteAttachment(
    @Param('projectId') projectId: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() user: User,
  ) {
    await this.projectsService.deleteAttachment(
      projectId,
      attachmentId,
      user.id,
      user.role,
    );
    return {
      success: true,
      message: 'Attachment deleted successfully',
    };
  }
}
