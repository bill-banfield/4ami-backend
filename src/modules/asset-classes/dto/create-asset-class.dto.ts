import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateAssetClassDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  industryId: number;

  @ApiProperty({ example: 'excavator' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Heavy excavation equipment', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
