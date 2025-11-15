import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateProjectTypeDto {
  @ApiProperty({
    example: 'residual_analysis',
    description: 'Unique code identifier for the project type',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Residual Analysis',
    description: 'Display name of the project type',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Asset residual value analysis project for equipment evaluation',
    description: 'Detailed description of the project type',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the project type is active',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
