import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { ProjectTypesService } from './project-types.service';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { ProjectTypeResponseDto } from './dto/project-type-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Project Types')
@ApiBearerAuth()
@Controller('project-types')
export class ProjectTypesController {
  constructor(private readonly projectTypesService: ProjectTypesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new project type (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Project type created successfully',
    type: ProjectTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Project type with this code already exists',
  })
  create(@Body() createProjectTypeDto: CreateProjectTypeDto) {
    return this.projectTypesService.create(createProjectTypeDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all project types without pagination' })
  @ApiResponse({
    status: 200,
    description: 'All project types retrieved successfully',
    type: [ProjectTypeResponseDto],
  })
  findAllWithoutPagination() {
    return this.projectTypesService.findAllWithoutPagination();
  }

  @Get()
  @ApiOperation({ summary: 'Get all project types (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Project types retrieved successfully',
  })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.projectTypesService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Project type retrieved successfully',
    type: ProjectTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  findOne(@Param('id') id: string) {
    return this.projectTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update project type (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Project type updated successfully',
    type: ProjectTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  @ApiResponse({
    status: 409,
    description: 'Project type with this code already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateProjectTypeDto: UpdateProjectTypeDto,
  ) {
    return this.projectTypesService.update(id, updateProjectTypeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete project type (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Project type deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete project type - it is in use',
  })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  async remove(@Param('id') id: string) {
    await this.projectTypesService.remove(id);
    return { message: 'Project type deleted successfully' };
  }
}
