import { IsOptional, IsEnum, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { PAGINATION, SORT_FIELDS, SORT_ORDERS } from '../constants/pagination.constants';

export class FilterProjectsDto {
  @ApiPropertyOptional({
    description: 'Search by project name or project number (case-insensitive partial match)',
    example: 'residual',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by project status',
    enum: ProjectStatus,
    example: ProjectStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Filter by industry (case-insensitive partial match)',
    example: 'construction',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  industry?: string;

  @ApiPropertyOptional({
    description: 'Filter by asset class/type (case-insensitive partial match)',
    example: 'excavator',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  assetClass?: string;

  @ApiPropertyOptional({
    description: 'Filter by equipment make (case-insensitive partial match)',
    example: 'caterpillar',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  make?: string;

  @ApiPropertyOptional({
    description: 'Filter by equipment model (case-insensitive partial match)',
    example: '320',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  model?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SORT_FIELDS,
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn([...SORT_FIELDS])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SORT_ORDERS,
    default: 'DESC',
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  @IsIn([...SORT_ORDERS])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: PAGINATION.MIN_PAGE,
    default: PAGINATION.DEFAULT_PAGE,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION.MIN_PAGE)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: PAGINATION.MIN_LIMIT,
    maximum: PAGINATION.MAX_LIMIT,
    default: PAGINATION.DEFAULT_LIMIT,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION.MIN_LIMIT)
  @Max(PAGINATION.MAX_LIMIT)
  limit?: number = PAGINATION.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: 'Offset for cursor-based pagination (alternative to page)',
    minimum: PAGINATION.MIN_OFFSET,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PAGINATION.MIN_OFFSET)
  offset?: number;
}

