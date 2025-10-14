import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateProjectSourceDto {
  @ApiProperty({ required: false, example: 'S-1002' })
  @IsOptional()
  @IsString()
  sourceNo?: string;

  @ApiProperty({ required: false, example: 'GreenTech Machinery' })
  @IsOptional()
  @IsString()
  sourceName?: string;

  @ApiProperty({ required: false, example: 'Direct Source' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiProperty({ required: false, example: 'Blair Nolan' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ required: false, example: 'Sales Manager' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  communication?: boolean;

  @ApiProperty({ required: false, example: '+1(123) 456-7890' })
  @IsOptional()
  @IsString()
  phoneNumber1?: string;

  @ApiProperty({ required: false, example: '+1(234) 567-8989' })
  @IsOptional()
  @IsString()
  phoneNumber2?: string;

  @ApiProperty({ required: false, example: 'b.nolan@greentechmachinery.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: 'www.greentechmachinery.com' })
  @IsOptional()
  @IsString()
  website?: string;
}
