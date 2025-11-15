import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsUUID,
  IsEnum,
  IsInt,
} from 'class-validator';
import { AssetStatus } from '../../../common/enums/asset-status.enum';

export class CreateEquipmentDto {
  // Hierarchical classification - IDs
  @ApiProperty({ example: 1, description: 'Industry ID' })
  @IsInt()
  industryId: number;

  @ApiProperty({ example: 1, description: 'Asset Class ID' })
  @IsInt()
  assetClassId: number;

  @ApiProperty({ example: 1, description: 'Make ID' })
  @IsInt()
  makeId: number;

  @ApiProperty({ example: 1, description: 'Model ID' })
  @IsInt()
  modelId: number;

  // Hierarchical classification - Names (for denormalization)
  @ApiProperty({
    example: 'construction',
    description: 'Industry name (lowercase)',
  })
  @IsString()
  industryName: string;

  @ApiProperty({
    example: 'excavator',
    description: 'Asset class name (lowercase)',
  })
  @IsString()
  assetClassName: string;

  @ApiProperty({ example: 'volvo', description: 'Make name (lowercase)' })
  @IsString()
  makeName: string;

  @ApiProperty({ example: 'a40g', description: 'Model name (lowercase)' })
  @IsString()
  modelName: string;

  // Physical specifications
  @ApiProperty({ example: 2023, required: false })
  @IsOptional()
  @IsInt()
  yearOfManufacture?: number;

  @ApiProperty({
    example: 10.5,
    description: 'Length in meters',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiProperty({
    example: 3.5,
    description: 'Width in meters',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({
    example: 3.8,
    description: 'Height in meters',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({
    example: 5000,
    description: 'Weight in pounds',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 'Requires wide load permit', required: false })
  @IsOptional()
  @IsString()
  specialTransportationConsideration?: string;

  // Financial data
  @ApiProperty({ example: 150000.0, required: false })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({ example: 30000.0, required: false })
  @IsOptional()
  @IsNumber()
  residualValue?: number;

  @ApiProperty({ enum: AssetStatus, required: false })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiProperty({
    example: { notes: 'Additional information' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
