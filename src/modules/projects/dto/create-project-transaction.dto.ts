import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectTransactionDto {
  @ApiProperty({ required: false, example: 2500 })
  @IsOptional()
  @IsNumber()
  currentMeter?: number;

  @ApiProperty({ required: false, example: 1500 })
  @IsOptional()
  @IsNumber()
  proposedAnnualUtilization?: number;

  @ApiProperty({ required: false, example: 'HPY' })
  @IsOptional()
  @IsString()
  meterUnit?: string;

  @ApiProperty({ required: false, example: 'N/A' })
  @IsOptional()
  @IsString()
  maintenanceRecords?: string;

  @ApiProperty({ required: false, example: 'N/A' })
  @IsOptional()
  @IsString()
  inspectionReport?: string;

  @ApiProperty({ required: false, example: 24 })
  @IsOptional()
  @IsNumber()
  terms?: number;

  @ApiProperty({ required: false, example: 'Bullet' })
  @IsOptional()
  @IsString()
  structure?: string;

  @ApiProperty({ required: false, example: 'Mining' })
  @IsOptional()
  @IsString()
  application?: string;

  @ApiProperty({ required: false, example: 'Outdoor' })
  @IsOptional()
  @IsString()
  environment?: string;
}
