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
import { IndustriesService } from './industries.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/user-role.enum';

@ApiTags('Industries')
@ApiBearerAuth()
@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new industry' })
  @ApiResponse({ status: 201, description: 'Industry created successfully' })
  @ApiResponse({ status: 409, description: 'Industry already exists' })
  create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industriesService.create(createIndustryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all industries with optional search' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Industries retrieved successfully',
  })
  findAll(@Query('search') search?: string) {
    return this.industriesService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get industry by ID' })
  @ApiResponse({ status: 200, description: 'Industry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Industry not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.industriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update industry' })
  @ApiResponse({ status: 200, description: 'Industry updated successfully' })
  @ApiResponse({ status: 404, description: 'Industry not found' })
  @ApiResponse({ status: 409, description: 'Industry name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIndustryDto: UpdateIndustryDto,
  ) {
    return this.industriesService.update(id, updateIndustryDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete industry' })
  @ApiResponse({ status: 200, description: 'Industry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Industry not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.industriesService.remove(id);
  }
}
