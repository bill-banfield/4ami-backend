import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class BulkImportDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CSV file with columns: Industry, Asset Class, Make, Model',
    required: true,
  })
  file: any;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Skip duplicate entries',
  })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Update existing entries',
  })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}
