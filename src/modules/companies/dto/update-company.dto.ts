import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'ABC Corporation', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ example: 'contact@abccorp.com', required: false })
  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  @ApiProperty({ example: '12-3456789', required: false })
  @IsOptional()
  @IsString()
  einTaxId?: string;

  @ApiProperty({ example: 'Northeast Branch', required: false })
  @IsOptional()
  @IsString()
  regionBranch?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiProperty({ example: 'Suite 100', required: false })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty({ example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;
}
