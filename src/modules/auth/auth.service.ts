import {BadRequestException, ConflictException, Injectable, UnauthorizedException,} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {v4 as uuidv4} from 'uuid';
import * as bcrypt from 'bcryptjs';

import {User} from '../../entities/user.entity';
import {UserRole} from '../../common/enums/user-role.enum';
import {SignUpDto} from './dto/signup.dto';
import {CustomerSignupDto} from './dto/customer-signup.dto';
import {AuthResponseDto} from './dto/auth-response.dto';
import {JwtPayload} from './interfaces/jwt-payload.interface';
import {EmailService} from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, role } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.CUSTOMER_USER,
      emailVerificationToken: uuidv4(),
    });

    const savedUser = await this.userRepository.save(user);
    
    // Send email verification
    try {
      await this.emailService.sendEmailVerification(
        savedUser.email,
        savedUser.emailVerificationToken,
      );
    } catch (error) {
      console.error('Failed to send email verification:', error);
      // Don't fail the signup if email fails
    }

    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  async customerSignUp(customerSignupDto: CustomerSignupDto): Promise<AuthResponseDto> {
    const { 
      email, 
      password, 
      confirmPassword, 
      firstName, 
      lastName, 
      title, 
      company, 
      phone, 
      source, 
      role, 
      invitationCode,
      agreeToTerms,
    } = customerSignupDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate terms agreement
    if (agreeToTerms !== 'true') {
      throw new BadRequestException('You must agree to the terms and conditions');
    }

    // Find user by invitation code
    const invitedUser = await this.userRepository.findOne({
      where: { emailVerificationToken: invitationCode },
    });

    if (!invitedUser) {
      throw new BadRequestException('Invalid or expired invitation code');
    }

    // Check if user already has a password (already completed signup)
    if (invitedUser.password) {
      throw new ConflictException('User has already completed signup');
    }

    // Check if email matches the invitation
    if (invitedUser.email !== email) {
      throw new BadRequestException('Email does not match the invitation');
    }

    // Update user with signup information
    invitedUser.password = password; // Let User entity handle hashing
    invitedUser.firstName = firstName;
    invitedUser.lastName = lastName;
    if (title) invitedUser.title = title;
    if (company) invitedUser.companyName = company;
    if (phone) invitedUser.phone = phone;
    if (source) invitedUser.source = source;
    invitedUser.role = role;
    invitedUser.isActive = true;
    invitedUser.isEmailVerified = true;
    invitedUser.emailVerificationToken = null; // Clear the invitation token

    const savedUser = await this.userRepository.save(invitedUser);
    const token = this.generateToken(savedUser);

    return { user: savedUser, token };
  }

  async signIn(user: User): Promise<AuthResponseDto> {
    console.log('🚀 SignIn called for user:', user.email);

    if (!user.isActive) {
      console.log('❌ Account is deactivated');
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login using query to avoid triggering BeforeUpdate hooks
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const token = this.generateToken(user);
    console.log('✅ SignIn successful, returning user and token');
    return { user, token };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    console.log('🔍 Validating user:', email);

    console.log('🔍 Password:', password);
    
    // Use raw query to completely bypass any decorator interference
    const result = await this.userRepository.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('📊 Query result length:', result.length);

    if (result.length === 0) {
      console.log('❌ No user found');
      return null;
    }

    const userData = result[0];
    console.log('👤 User found:', userData.email, 'Password hash exists:', !!userData.password);
    
    // Check if user has a password set
    if (!userData.password) {
      console.log('❌ User has no password set');
      return null;
    }
    
    // Validate password using bcrypt directly
    const isValidPassword = await bcrypt.compare(password, userData.password);
    
    console.log('🔐 Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return null;
    }

    // Create User object manually to avoid any decorator issues
    const user = new User();
    user.id = userData.id;
    user.email = userData.email;
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.title = userData.title;
    user.phone = userData.phone;
    user.companyName = userData.companyName;
    user.source = userData.source;
    user.role = userData.role;
    user.isActive = userData.isActive;
    user.isEmailVerified = userData.isEmailVerified;
    user.emailVerificationToken = userData.emailVerificationToken;
    user.passwordResetToken = userData.passwordResetToken;
    user.passwordResetExpires = userData.passwordResetExpires;
    user.lastLoginAt = userData.lastLoginAt;
    user.createdAt = userData.createdAt;
    user.updatedAt = userData.updatedAt;

    console.log('✅ User validation successful');
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async verifyEmail(token: string, email: string): Promise<User> {
    // Find user by both email and token where email is not verified
    const user = await this.userRepository.findOne({
      where: {
        email,
        emailVerificationToken: token,
        isEmailVerified: false
      },
    });

    if (!user) {
      throw new ConflictException('Email and verification token do not match or user is already verified');
    }

    // Use update query to avoid triggering BeforeUpdate hooks
    // Don't set emailVerificationToken to null immediately
    // Keep it for a short period to allow multiple verification attempts
    // The token will be cleared by a cleanup job or after a certain time
    await this.userRepository.update(user.id, { isEmailVerified: true });

    return user;
  }

  async clearVerificationToken(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (user && user.isEmailVerified) {
      // Use update query to avoid triggering BeforeUpdate hooks
      await this.userRepository.update(user.id, { emailVerificationToken: null });
    }
  }

  async seedDatabase(): Promise<void> {
    try {
      // Import and run the seeder
      const { Seeder } = await import('../../seeders');
      const dataSource = this.userRepository.manager.connection;
      const seeder = new Seeder(dataSource);
      await seeder.run();
    } catch (error) {
      console.error('Database seeding failed:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Use update query to avoid triggering BeforeUpdate hooks
    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordReset(email, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't fail the request if email fails
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
