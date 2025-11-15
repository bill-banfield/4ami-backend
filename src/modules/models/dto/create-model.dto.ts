import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateModelDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  industryId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  assetClassId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  makeId: number;

  @ApiProperty({ example: 'a40g' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Volvo A40G articulated hauler', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
