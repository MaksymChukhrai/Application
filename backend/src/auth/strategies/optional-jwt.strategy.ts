import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class OptionalJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-optional',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Called only when token is present and cryptographically valid.
  // Returns minimal payload — full User entity is not needed for isJoined check.
  async validate(payload: JwtPayload): Promise<{ id: string; email: string }> {
    return { id: payload.sub, email: payload.email };
  }
}
