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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AssetStatus } from '../../common/enums/asset-status.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  create(@Body() createAssetDto: CreateAssetDto, @CurrentUser() user: User) {
    return this.assetsService.create(createAssetDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  findAll(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('projectId') projectId?: string,
  ) {
    return this.assetsService.findAll(page, limit, projectId, user.id, user.role);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get asset dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats(@CurrentUser() user: User) {
    return this.assetsService.getDashboardStats(user.id, user.role);
  }

  @Get('form')
  @ApiOperation({ summary: 'Generate asset form fields' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Asset form fields generated' })
  generateAssetForm(@Query('projectId') projectId?: string) {
    return this.assetsService.generateAssetForm(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.update(id, updateAssetDto, user.id, user.role);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update asset status' })
  @ApiResponse({ status: 200, description: 'Asset status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AssetStatus,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.updateStatus(id, status, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetsService.remove(id, user.id, user.role);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import assets from CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Bulk import job started' })
  @UseInterceptors(FileInterceptor('file'))
  bulkImport(
    @Body() bulkImportDto: BulkImportDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.bulkImport(bulkImportDto, user.id);
  }
}
