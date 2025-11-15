import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Matches } from 'class-validator';

export class RegisterCompanyDto {
  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'contact@abccorp.com' })
  @IsEmail()
  companyEmail: string;

  @ApiProperty({ example: '12-3456789' })
  @IsString()
  @Matches(/^\d{2}-\d{7}$/, {
    message: 'EIN/Tax ID must follow the format XX-XXXXXXX (e.g., 12-3456789)',
  })
  einTaxId: string;

  @ApiProperty({ example: 'Northeast Branch', required: false })
  @IsOptional()
  @IsString()
  regionBranch?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  mobile: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  address1: string;

  @ApiProperty({ example: 'Suite 100', required: false })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  zip: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  country: string;
}
