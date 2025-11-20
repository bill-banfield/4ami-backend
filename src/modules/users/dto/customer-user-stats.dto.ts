import { ApiProperty } from '@nestjs/swagger';

export class CustomerUserStatsDto {
  @ApiProperty({ description: 'Total number of projects created by this user' })
  totalPersonalProjects: number;
}

