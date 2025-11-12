import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../../../common/enums/project-status.enum';
import { CreateProjectClientDto } from './create-project-client.dto';
import { CreateProjectSourceDto } from './create-project-source.dto';
import { CreateProjectEquipmentDto } from './create-project-equipment.dto';
import { CreateProjectFinancialDto } from './create-project-financial.dto';
import { CreateProjectTransactionDto } from './create-project-transaction.dto';
import { CreateUtilizationScenarioDto } from './create-utilization-scenario.dto';

export class CreateProjectDto {
  @ApiProperty({ example: 'residual_analysis' })
  @IsString()
  projectTypeCode: string;

  @ApiProperty({ example: 'Buneeon Sand Volvo A4GG Water Truck' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A comprehensive asset management project', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-08-15', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: ProjectStatus.DRAFT,
    enum: ProjectStatus,
    required: false,
    description: 'Project status. If not provided, defaults to PENDING (submitted). Provide "draft" to save as draft without sending notifications.'
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ example: { priority: 'high', category: 'infrastructure' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false, type: CreateProjectClientDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProjectClientDto)
  client?: CreateProjectClientDto;

  @ApiProperty({ required: false, type: CreateProjectSourceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProjectSourceDto)
  source?: CreateProjectSourceDto;

  @ApiProperty({ required: false, type: [CreateProjectEquipmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectEquipmentDto)
  equipments?: CreateProjectEquipmentDto[];

  @ApiProperty({ required: false, type: CreateProjectFinancialDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProjectFinancialDto)
  financial?: CreateProjectFinancialDto;

  @ApiProperty({ required: false, type: CreateProjectTransactionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProjectTransactionDto)
  transaction?: CreateProjectTransactionDto;

  @ApiProperty({ required: false, type: [CreateUtilizationScenarioDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUtilizationScenarioDto)
  utilizationScenarios?: CreateUtilizationScenarioDto[];
}
