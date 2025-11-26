import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserVerificationResponseDto } from './dto/user-verification-response.dto';
import { UserInvitationDetailsDto } from './dto/user-invitation-details.dto';
import { CustomerAdminStatsDto } from './dto/customer-admin-stats.dto';
import { CustomerUserStatsDto } from './dto/customer-user-stats.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: User) {
    return this.usersService.create(createUserDto, user.id);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserResponseDto],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: User,
  ) {
    return this.usersService.findAll(page, limit, user);
  }

  @Get('test-serialization')
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Test user serialization (no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Test user data with password excluded',
    type: UserResponseDto,
  })
  async testSerialization() {
    const user = await this.usersService.findOne(
      '116c4018-ed1c-41a0-ad8f-bc05d6448d03',
    );
    return { user };
  }

  @Get('dashboard/stats')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Get user dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats() {
    return this.usersService.getDashboardStats();
  }

  @Get('customer-admin/stats')
  @Roles(UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Get Customer Admin company statistics' })
  @ApiResponse({
    status: 200,
    description: 'Customer Admin stats retrieved successfully',
    type: CustomerAdminStatsDto,
  })
  getCustomerAdminStats(
    @CurrentUser() user: User,
  ): Promise<CustomerAdminStatsDto> {
    return this.usersService.getCustomerAdminStats(user);
  }

  @Get('customer-user/stats')
  @Roles(UserRole.CUSTOMER_USER)
  @ApiOperation({ summary: 'Get Customer User personal statistics' })
  @ApiResponse({
    status: 200,
    description: 'Customer User stats retrieved successfully',
    type: CustomerUserStatsDto,
  })
  getCustomerUserStats(
    @CurrentUser() user: User,
  ): Promise<CustomerUserStatsDto> {
    return this.usersService.getCustomerUserStats(user);
  }

  @Get('invitation')
  @Public()
  @ApiOperation({ summary: 'Get user details by invitation code' })
  @ApiQuery({ name: 'invitationCode', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    type: UserInvitationDetailsDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invitation code is required' })
  async getUserByInvitationCode(
    @Query('invitationCode') invitationCode: string,
  ): Promise<UserInvitationDetailsDto> {
    if (!invitationCode) {
      throw new NotFoundException('Invitation code is required');
    }

    const user = await this.usersService.findByInvitationCode(invitationCode);
    if (!user) {
      throw new NotFoundException(
        'User not found with the provided invitation code',
      );
    }

    // Return only the specified fields for security
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      companyName: user.companyName,
      source: user.source,
      role: user.role,
    };
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.remove(id, user);
  }

  @Post('invite')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Invite a new user' })
  @ApiResponse({ status: 201, description: 'User invitation sent' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  inviteUser(@Body() inviteUserDto: InviteUserDto, @CurrentUser() user: User) {
    return this.usersService.inviteUser(inviteUserDto, user.id);
  }

  @Get('verify-token/:token')
  @Public()
  @ApiOperation({ summary: 'Get user by email verification token' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserVerificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByVerificationToken(
    @Param('token') token: string,
  ): Promise<UserVerificationResponseDto> {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }
    // Manually construct response to include emailVerificationToken
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      phone: user.phone,
      companyName: user.companyName,
      source: user.source,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      emailVerificationToken: user.emailVerificationToken,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  }

  @Get('verify-status/:email')
  @Public()
  @ApiOperation({ summary: 'Get user verification status by email' })
  @ApiResponse({
    status: 200,
    description: 'User verification status found',
    type: UserVerificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserVerificationStatus(
    @Param('email') email: string,
  ): Promise<UserVerificationResponseDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Manually construct response to include emailVerificationToken
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      phone: user.phone,
      companyName: user.companyName,
      source: user.source,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      emailVerificationToken: user.emailVerificationToken,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName} ${user.lastName}`,
    };
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  activateUser(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.activateUser(id, user);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER_ADMIN)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  deactivateUser(@Param('id') id: string, @CurrentUser() user: User) {
    return this.usersService.deactivateUser(id, user);
  }
}
