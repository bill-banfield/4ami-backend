import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateUtilizationScenarioDto {
  @ApiProperty({ required: false, example: 'uuid-of-equipment' })
  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  scenarioNo?: number;

  @ApiProperty({ required: false, example: 24 })
  @IsOptional()
  @IsNumber()
  terms?: number;

  @ApiProperty({ required: false, example: 1500 })
  @IsOptional()
  @IsNumber()
  proposedUtilization?: number;

  @ApiProperty({ required: false, example: 125.50 })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}
