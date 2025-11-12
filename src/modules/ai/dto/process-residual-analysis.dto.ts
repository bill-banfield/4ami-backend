import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional, IsUUID } from 'class-validator';

export class ProcessResidualAnalysisDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ example: { age: 5, condition: 'good', usage: 'moderate' } })
  @IsObject()
  formData: Record<string, any>;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ example: 'residual_value_analysis', required: false })
  @IsOptional()
  @IsString()
  analysisType?: string;
}
