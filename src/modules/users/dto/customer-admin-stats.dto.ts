import { ApiProperty } from '@nestjs/swagger';

export class CustomerAdminStatsDto {
  @ApiProperty({ description: 'Total number of company projects' })
  totalCompanyProjects: number;

  @ApiProperty({ description: 'Total number of company users' })
  totalCompanyUsers: number;
}
