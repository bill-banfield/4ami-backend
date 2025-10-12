import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from '../../entities/company.entity';
import { User } from '../../entities/user.entity';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { EmailService } from '../email/email.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async register(registerCompanyDto: RegisterCompanyDto, userId: string): Promise<Company> {
    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is CUSTOMER_ADMIN
    if (user.role !== UserRole.CUSTOMER_ADMIN) {
      throw new BadRequestException('Only customer admins can register companies');
    }

    // Check if user already belongs to a company
    if (user.companyId) {
      throw new ConflictException('You already belong to a company. Cannot create a new company.');
    }

    // Create company
    const company = this.companyRepository.create({
      ...registerCompanyDto,
      createdById: userId,
    });

    const savedCompany = await this.companyRepository.save(company);

    // Update user's companyId
    user.companyId = savedCompany.id;
    await this.userRepository.save(user);

    // Send email notification to system admin
    try {
      await this.emailService.sendCompanyRegistrationNotification(savedCompany, user);
    } catch (error) {
      console.error('Failed to send company registration email:', error);
      // Don't fail the registration if email fails
    }

    return savedCompany;
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['createdBy', 'users'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    companies: Company[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [companies, total] = await this.companyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });

    return {
      companies,
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string): Promise<Company> {
    // Find the company
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Find the user making the request
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is CUSTOMER_ADMIN
    if (user.role !== UserRole.CUSTOMER_ADMIN) {
      throw new BadRequestException('Only customer admins can update companies');
    }

    // Check if user belongs to this company
    if (user.companyId !== id) {
      throw new BadRequestException('You can only update your own company');
    }

    // Update company details
    Object.assign(company, updateCompanyDto);

    return this.companyRepository.save(company);
  }
}
