import { ApiProperty } from '@nestjs/swagger';

export class ProjectTypeResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'residual_analysis' })
  code: string;

  @ApiProperty({ example: 'Residual Analysis' })
  name: string;

  @ApiProperty({
    example: 'Asset residual value analysis project for equipment evaluation',
    nullable: true
  })
  description: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
