import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectEquipmentDto {
  @ApiProperty({ required: false, example: 'Construction' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ required: false, example: 'Heavy Equipment' })
  @IsOptional()
  @IsString()
  assetClass?: string;

  @ApiProperty({ required: false, example: 'Volvo' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiProperty({ required: false, example: 'A4GG' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false, example: 2023 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  currentMeterReading?: number;

  @ApiProperty({ required: false, example: 'Hours' })
  @IsOptional()
  @IsString()
  meterType?: string;

  @ApiProperty({ required: false, example: 1200 })
  @IsOptional()
  @IsNumber()
  proposedUtilization?: number;

  @ApiProperty({ required: false, example: 'New' })
  @IsOptional()
  @IsString()
  environmentRanking?: string;
}
