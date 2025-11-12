import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Welcome to 4AMI Platform' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Welcome to our platform!' })
  @IsString()
  text: string;

  @ApiProperty({ example: '<h1>Welcome to our platform!</h1>', required: false })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiProperty({ example: ['cc@example.com'], required: false })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiProperty({ example: ['bcc@example.com'], required: false })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];
}
