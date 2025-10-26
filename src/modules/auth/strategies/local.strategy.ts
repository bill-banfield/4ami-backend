import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { User } from '../../../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<User> {
    console.log('🔐 LocalStrategy validate called for:', email);
    const user = await this.authService.validateUser(email, password);
    console.log('👤 LocalStrategy user result:', user ? 'Found' : 'Not found');
    if (!user) {
      console.log('❌ LocalStrategy throwing UnauthorizedException');
      throw new UnauthorizedException();
    }
    console.log('✅ LocalStrategy returning user');
    return user;
  }
}
