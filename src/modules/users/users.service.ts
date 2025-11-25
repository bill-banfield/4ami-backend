import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../../entities/user.entity';
import { Project } from '../../entities/project.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { EmailService } from '../email/email.service';
import { CustomerAdminStatsDto } from './dto/customer-admin-stats.dto';
import { CustomerUserStatsDto } from './dto/customer-user-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private emailService: EmailService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    creatorId?: string,
  ): Promise<User> {
    const { email, firstName, lastName, role, phone } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // If creator is provided, check if CUSTOMER_ADMIN has registered their company
    let creatorCompanyId = null;
    if (creatorId) {
      const creator = await this.userRepository.findOne({
        where: { id: creatorId },
      });

      if (creator) {
        // Check if CUSTOMER_ADMIN has registered their company
        if (creator.role === UserRole.CUSTOMER_ADMIN && !creator.companyId) {
          throw new BadRequestException(
            'You must register your company before creating users',
          );
        }
        creatorCompanyId = creator.companyId;
      }
    }

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      role: role || UserRole.CUSTOMER_USER,
      phone,
      emailVerificationToken: uuidv4(),
      createdById: creatorId,
      companyId: creatorCompanyId,
    });

    const savedUser = await this.userRepository.save(user);

    // Send user credentials email
    try {
      await this.emailService.sendUserCredentials(
        savedUser,
        savedUser.emailVerificationToken,
      );
    } catch (error) {
      console.error('Failed to send user credentials email:', error);
      // Don't fail the user creation if email fails
    }

    return savedUser;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    currentUser?: User,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryOptions: any = {
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['company'],
    };

    // If the current user is a CUSTOMER_ADMIN, filter by their company
    if (
      currentUser &&
      currentUser.role === UserRole.CUSTOMER_ADMIN &&
      currentUser.companyId
    ) {
      queryOptions.where = { companyId: currentUser.companyId };
    }
    // If the current user is ADMIN, return all users (no filtering)

    const [users, total] = await this.userRepository.findAndCount(queryOptions);

    // Map company name from company relation
    const mappedUsers = users.map(user => {
      if (user.company) {
        user.companyName = user.company.companyName;
      }
      return user;
    });

    return {
      users: mappedUsers,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, currentUser?: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If current user is CUSTOMER_ADMIN, check if the user belongs to their company
    if (currentUser && currentUser.role === UserRole.CUSTOMER_ADMIN) {
      if (user.companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'You can only view users from your own company',
        );
      }
    }

    // Map company name from company relation
    if (user.company) {
      user.companyName = user.company.companyName;
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async findByInvitationCode(invitationCode: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailVerificationToken: invitationCode },
    });
  }

  async findByEmailVerificationTokenOrEmail(
    token: string,
    email?: string,
  ): Promise<User | null> {
    // First try to find by token
    let user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    // If not found by token and email is provided, try to find by email
    // This handles cases where the user is already verified (token is null)
    if (!user && email) {
      user = await this.userRepository.findOne({
        where: { email },
      });
    }

    return user;
  }

  async findUserForVerification(token: string): Promise<User | null> {
    // First try to find by verification token (for unverified users)
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    // If not found by token, this might be a case where the user was already verified
    // We need to find the user by other means - this is a limitation of the current approach
    // The token should ideally be preserved or we need a different mechanism

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: User,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If current user is CUSTOMER_ADMIN, check if the user belongs to their company
    if (currentUser && currentUser.role === UserRole.CUSTOMER_ADMIN) {
      if (user.companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'You can only update users from your own company',
        );
      }
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Use update query to avoid triggering BeforeUpdate hooks that would re-hash the password
    await this.userRepository.update(id, updateUserDto);

    // Fetch and return the updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    return updatedUser;
  }

  async remove(id: string, currentUser?: User): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If current user is CUSTOMER_ADMIN, check if the user belongs to their company
    if (currentUser && currentUser.role === UserRole.CUSTOMER_ADMIN) {
      if (user.companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'You can only delete users from your own company',
        );
      }
    }

    await this.userRepository.remove(user);
  }

  async inviteUser(
    inviteUserDto: InviteUserDto,
    inviterId: string,
  ): Promise<User> {
    const {
      email,
      firstName,
      lastName,
      title,
      role,
      invitationCode,
      company: companyName,
      source,
    } = inviteUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get inviter's details to auto-assign companyId
    const inviter = await this.userRepository.findOne({
      where: { id: inviterId },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter user not found');
    }

    // Check if CUSTOMER_ADMIN has registered their company
    if (inviter.role === UserRole.CUSTOMER_ADMIN && !inviter.companyId) {
      throw new BadRequestException(
        'You must register your company before inviting users',
      );
    }

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      title,
      role: role || UserRole.CUSTOMER_USER,
      companyName,
      source,
      isActive: false, // User needs to complete signup
      emailVerificationToken: invitationCode, // Use the frontend-generated code
      createdById: inviterId,
      companyId: inviter.companyId, // Auto-assign company from inviter
    });

    const savedUser = await this.userRepository.save(user);

    // Send user credentials email
    try {
      await this.emailService.sendUserCredentials(
        savedUser,
        savedUser.emailVerificationToken,
      );
    } catch (error) {
      console.error('Failed to send user credentials email:', error);
      // Don't fail the user creation if email fails
    }

    return savedUser;
  }

  async activateUser(id: string, currentUser?: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If current user is CUSTOMER_ADMIN, check if the user belongs to their company
    if (currentUser && currentUser.role === UserRole.CUSTOMER_ADMIN) {
      if (user.companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'You can only activate users from your own company',
        );
      }
    }

    // Use update query to avoid triggering BeforeUpdate hooks
    await this.userRepository.update(id, { isActive: true });

    // Fetch and return the updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    return updatedUser;
  }

  async deactivateUser(id: string, currentUser?: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If current user is CUSTOMER_ADMIN, check if the user belongs to their company
    if (currentUser && currentUser.role === UserRole.CUSTOMER_ADMIN) {
      if (user.companyId !== currentUser.companyId) {
        throw new BadRequestException(
          'You can only deactivate users from your own company',
        );
      }
    }

    // Use update query to avoid triggering BeforeUpdate hooks
    await this.userRepository.update(id, { isActive: false });

    // Fetch and return the updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    return updatedUser;
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    const [totalUsers, activeUsers, pendingUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { isActive: false } }),
    ]);

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const roleStats = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      },
      {} as Record<UserRole, number>,
    );

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      usersByRole: roleStats,
    };
  }

  async getCustomerAdminStats(
    currentUser: User,
  ): Promise<CustomerAdminStatsDto> {
    if (!currentUser.companyId) {
      throw new BadRequestException(
        'Customer Admin must be associated with a company',
      );
    }

    const [totalCompanyProjects, totalCompanyUsers] = await Promise.all([
      this.projectRepository.count({
        where: { companyId: currentUser.companyId },
      }),
      this.userRepository.count({
        where: { companyId: currentUser.companyId },
      }),
    ]);

    return {
      totalCompanyProjects,
      totalCompanyUsers,
    };
  }

  async getCustomerUserStats(currentUser: User): Promise<CustomerUserStatsDto> {
    const totalPersonalProjects = await this.projectRepository.count({
      where: { createdById: currentUser.id },
    });

    return {
      totalPersonalProjects,
    };
  }
}
