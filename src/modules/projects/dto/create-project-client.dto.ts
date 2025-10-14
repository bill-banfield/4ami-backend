import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateProjectClientDto {
  @ApiProperty({ required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiProperty({ required: false, example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @ApiProperty({ required: false, example: '+1234567890' })
  @IsOptional()
  @IsString()
  lesseePhone?: string;

  @ApiProperty({ required: false, example: 'US' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ required: false, example: 'www.example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  communicationPreference?: boolean;
}
