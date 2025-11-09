import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AssetClassesService } from './asset-classes.service';
import { CreateAssetClassDto } from './dto/create-asset-class.dto';
import { UpdateAssetClassDto } from './dto/update-asset-class.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Asset Classes')
@ApiBearerAuth()
@Controller('asset-classes')
export class AssetClassesController {
  constructor(private readonly assetClassesService: AssetClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset class' })
  @ApiResponse({ status: 201, description: 'Asset class created successfully' })
  @ApiResponse({ status: 409, description: 'Asset class already exists' })
  create(@Body() createAssetClassDto: CreateAssetClassDto) {
    return this.assetClassesService.create(createAssetClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset classes with optional filters' })
  @ApiQuery({ name: 'industryId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Asset classes retrieved successfully' })
  findAll(
    @Query('industryId') industryId?: string,
    @Query('search') search?: string,
  ) {
    const parsedIndustryId = industryId ? parseInt(industryId, 10) : undefined;
    return this.assetClassesService.findAll(parsedIndustryId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset class by ID' })
  @ApiResponse({ status: 200, description: 'Asset class retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset class not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetClassesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update asset class' })
  @ApiResponse({ status: 200, description: 'Asset class updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset class not found' })
  @ApiResponse({ status: 409, description: 'Asset class name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetClassDto: UpdateAssetClassDto,
  ) {
    return this.assetClassesService.update(id, updateAssetClassDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete asset class' })
  @ApiResponse({ status: 200, description: 'Asset class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset class not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetClassesService.remove(id);
  }
}
