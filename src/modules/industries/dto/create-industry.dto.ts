import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateIndustryDto {
  @ApiProperty({ example: 'construction' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Construction industry assets', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
