import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectFinancialDto {
  @ApiProperty({ required: false, example: 150000 })
  @IsOptional()
  @IsNumber()
  subjectPrice?: number;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  concession?: number;

  @ApiProperty({ required: false, example: 'Yes' })
  @IsOptional()
  @IsString()
  extendedWarranty?: string;

  @ApiProperty({ required: false, example: 'Included' })
  @IsOptional()
  @IsString()
  maintenancePMs?: string;
}
