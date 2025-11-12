import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'Asset Analysis Report' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Comprehensive asset analysis report', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: { reportType: 'asset_analysis', format: 'pdf' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
