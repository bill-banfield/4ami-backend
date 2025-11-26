import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project } from '../../../entities/project.entity';

export class PaginatedProjectsResponseDto {
  @ApiProperty({
    description: 'Array of projects',
    type: [Project],
  })
  projects: Project[];

  @ApiProperty({
    description: 'Total number of projects matching the filters',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Offset value (for cursor-based pagination)',
    example: 0,
  })
  offset?: number;

  @ApiProperty({
    description: 'Indicates if there are more results available',
    example: true,
  })
  hasMore: boolean;
}
