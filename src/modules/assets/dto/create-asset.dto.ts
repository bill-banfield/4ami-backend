import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject, IsUUID, IsEnum } from 'class-validator';
import { AssetStatus } from '../../../common/enums/asset-status.enum';

export class CreateAssetDto {
  @ApiProperty({ example: 'Laptop Computer' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dell Latitude 5520', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'equipment' })
  @IsString()
  type: string;

  @ApiProperty({ example: 1500.00, required: false })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiProperty({ example: 300.00, required: false })
  @IsOptional()
  @IsNumber()
  residualValue?: number;

  @ApiProperty({ enum: AssetStatus, required: false })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiProperty({ example: { brand: 'Dell', model: 'Latitude 5520' }, required: false })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiProperty({ example: { notes: 'Company laptop' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
