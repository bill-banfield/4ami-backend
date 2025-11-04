import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MakesService } from './makes.service';
import { CreateMakeDto } from './dto/create-make.dto';
import { UpdateMakeDto } from './dto/update-make.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Makes')
@ApiBearerAuth()
@Controller('makes')
export class MakesController {
  constructor(private readonly makesService: MakesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new make' })
  @ApiResponse({ status: 201, description: 'Make created successfully' })
  @ApiResponse({ status: 409, description: 'Make already exists' })
  create(@Body() createMakeDto: CreateMakeDto) {
    return this.makesService.create(createMakeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all makes with optional filters' })
  @ApiQuery({ name: 'industryId', required: false, type: Number })
  @ApiQuery({ name: 'assetClassId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Makes retrieved successfully' })
  findAll(
    @Query('industryId') industryId?: string,
    @Query('assetClassId') assetClassId?: string,
    @Query('search') search?: string,
  ) {
    const parsedIndustryId = industryId ? parseInt(industryId, 10) : undefined;
    const parsedAssetClassId = assetClassId ? parseInt(assetClassId, 10) : undefined;
    return this.makesService.findAll(parsedIndustryId, parsedAssetClassId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get make by ID' })
  @ApiResponse({ status: 200, description: 'Make retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Make not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.makesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update make' })
  @ApiResponse({ status: 200, description: 'Make updated successfully' })
  @ApiResponse({ status: 404, description: 'Make not found' })
  @ApiResponse({ status: 409, description: 'Make name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMakeDto: UpdateMakeDto,
  ) {
    return this.makesService.update(id, updateMakeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete make' })
  @ApiResponse({ status: 200, description: 'Make deleted successfully' })
  @ApiResponse({ status: 404, description: 'Make not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.makesService.remove(id);
  }
}
