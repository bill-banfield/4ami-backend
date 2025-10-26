import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class BulkImportDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}
