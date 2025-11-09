import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateMakeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  industryId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  assetClassId: number;

  @ApiProperty({ example: 'volvo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Volvo construction equipment', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
